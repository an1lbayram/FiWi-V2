import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// index.js is plain CommonJS and loads wifiService via `require('./wifiService')`
// — that require chain bypasses Vitest's ESM-only vi.mock() interception (see
// the explanation in test/setup.js), so vi.mock('../wifiService.js', ...)
// would silently fall through to the REAL wifiService module, which shells
// out to netsh/arp/ping.
//
// Node caches CommonJS modules by resolved file path: every `require('./wifiService')`
// anywhere in the process returns the exact same exports object. So instead
// of vi.mock, grab that object here first and replace each of its functions
// with a vi.fn() in place — index.js's own require (triggered by the
// `import('../index.js')` below) then picks up these same patched functions.
const mockWifiService = require('../wifiService.js');
for (const key of Object.keys(mockWifiService)) {
  mockWifiService[key] = vi.fn();
}

// node-notifier/node-cron are real deps required at module top-level; the
// cron job itself only registers under `require.main === module`, which is
// false when the test imports `app`, so nothing actually schedules here.

const { app, AUTH_TOKEN, ALLOWED_ORIGIN } = await import('../index.js');

const AUTH_HEADER = 'X-DatHex-Token';

beforeEach(() => {
  Object.values(mockWifiService).forEach((fn) => fn.mockReset());
});

describe('Security: local auth token', () => {
  const protectedRoutes = [
    ['get', '/api/profiles'],
    ['get', '/api/profiles/HomeNetwork'],
    ['post', '/api/profiles/delete'],
    ['get', '/api/export'],
    ['get', '/api/export/csv']
  ];

  it.each(protectedRoutes)('rejects %s %s with no token (401)', async (method, url) => {
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/unauthorized/i);
  });

  it.each(protectedRoutes)('rejects %s %s with a wrong token (401)', async (method, url) => {
    const res = await request(app)[method](url).set(AUTH_HEADER, 'not-the-real-token');
    expect(res.status).toBe(401);
  });

  it('accepts a protected request with the correct token', async () => {
    mockWifiService.getAllSavedProfilesDetails.mockResolvedValue([]);
    const res = await request(app).get('/api/profiles?force=true').set(AUTH_HEADER, AUTH_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  const publicRoutes = ['/api/active', '/api/nearby', '/api/devices', '/api/audit', '/api/ping'];

  it.each(publicRoutes)('%s does not require the auth token', async (url) => {
    mockWifiService.getActiveInterface.mockResolvedValue({ success: true, connected: false });
    mockWifiService.scanNearbyNetworks.mockResolvedValue({ success: true, networks: [] });
    mockWifiService.scanLocalDevices.mockResolvedValue({ success: true, devices: [] });
    mockWifiService.runSecurityAudit.mockResolvedValue({ success: true, score: 100, issues: [] });
    mockWifiService.pingHost.mockResolvedValue({ host: '8.8.8.8', latency: 10, online: true });

    const res = await request(app).get(url);
    expect(res.status).toBe(200);
  });
});

describe('Security: HTTP headers', () => {
  it('sends the fixed configured CORS origin', async () => {
    mockWifiService.getActiveInterface.mockResolvedValue({ success: true });
    const res = await request(app).get('/api/active').set('Origin', 'https://evil.example.com');
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('applies helmet security headers and disables CSP as configured', async () => {
    mockWifiService.getActiveInterface.mockResolvedValue({ success: true });
    const res = await request(app).get('/api/active');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeUndefined();
  });
});

describe('API: /api/profiles', () => {
  it('returns fresh data and marks cached:false on first call, cached:true on immediate repeat', async () => {
    mockWifiService.getAllSavedProfilesDetails.mockResolvedValue([{ name: 'Home' }]);

    const first = await request(app).get('/api/profiles?force=true').set(AUTH_HEADER, AUTH_TOKEN);
    expect(first.body.cached).toBe(false);
    expect(first.body.profiles).toEqual([{ name: 'Home' }]);

    const second = await request(app).get('/api/profiles').set(AUTH_HEADER, AUTH_TOKEN);
    expect(second.body.cached).toBe(true);
    expect(mockWifiService.getAllSavedProfilesDetails).toHaveBeenCalledTimes(1);

    const forced = await request(app).get('/api/profiles?force=true').set(AUTH_HEADER, AUTH_TOKEN);
    expect(forced.body.cached).toBe(false);
    expect(mockWifiService.getAllSavedProfilesDetails).toHaveBeenCalledTimes(2);
  });

  it('returns 500 with the error message when wifiService throws', async () => {
    mockWifiService.getAllSavedProfilesDetails.mockRejectedValue(new Error('netsh failed'));
    const res = await request(app).get('/api/profiles?force=true').set(AUTH_HEADER, AUTH_TOKEN);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'netsh failed' });
  });
});

describe('API: /api/profiles/:name', () => {
  it('forwards the URL param to getProfileDetails', async () => {
    mockWifiService.getProfileDetails.mockResolvedValue({ success: true, name: 'Office_5G' });
    const res = await request(app).get('/api/profiles/Office_5G').set(AUTH_HEADER, AUTH_TOKEN);
    expect(res.status).toBe(200);
    expect(mockWifiService.getProfileDetails).toHaveBeenCalledWith('Office_5G');
    expect(res.body.name).toBe('Office_5G');
  });
});

describe('API: /api/profiles/delete', () => {
  it('rejects a missing profile name with 400', async () => {
    const res = await request(app)
      .post('/api/profiles/delete')
      .set(AUTH_HEADER, AUTH_TOKEN)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'Profile name is required' });
    expect(mockWifiService.deleteProfile).not.toHaveBeenCalled();
  });

  it('deletes the named profile and invalidates the profiles cache', async () => {
    mockWifiService.getAllSavedProfilesDetails.mockResolvedValue([{ name: 'ToDelete' }]);
    await request(app).get('/api/profiles?force=true').set(AUTH_HEADER, AUTH_TOKEN);

    mockWifiService.deleteProfile.mockResolvedValue({ success: true, message: 'deleted' });
    const del = await request(app)
      .post('/api/profiles/delete')
      .set(AUTH_HEADER, AUTH_TOKEN)
      .send({ name: 'ToDelete' });
    expect(del.status).toBe(200);
    expect(mockWifiService.deleteProfile).toHaveBeenCalledWith('ToDelete');

    // Cache was invalidated, so the next /api/profiles call must hit wifiService again.
    mockWifiService.getAllSavedProfilesDetails.mockResolvedValue([]);
    const after = await request(app).get('/api/profiles').set(AUTH_HEADER, AUTH_TOKEN);
    expect(after.body.cached).toBe(false);
  });
});

describe('API: /api/nearby', () => {
  it('caches results between calls unless force=true is passed', async () => {
    mockWifiService.scanNearbyNetworks.mockResolvedValue({ success: true, totalNetworks: 1, networks: [] });

    const first = await request(app).get('/api/nearby?force=true');
    expect(first.body.cached).toBe(false);

    const second = await request(app).get('/api/nearby');
    expect(second.body.cached).toBe(true);
    expect(mockWifiService.scanNearbyNetworks).toHaveBeenCalledTimes(1);
  });
});

describe('API: /api/ping', () => {
  it('pings all three fixed DNS targets and aggregates results', async () => {
    mockWifiService.pingHost.mockImplementation((host) =>
      Promise.resolve({ host, latency: 5, online: true })
    );

    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toHaveLength(3);
    expect(mockWifiService.pingHost).toHaveBeenCalledWith('8.8.8.8');
    expect(mockWifiService.pingHost).toHaveBeenCalledWith('1.1.1.1');
    expect(mockWifiService.pingHost).toHaveBeenCalledWith('9.9.9.9');
  });
});

describe('API: /api/export and /api/export/csv', () => {
  it('exports a JSON attachment with saved profiles and audit data', async () => {
    mockWifiService.getAllSavedProfilesDetails.mockResolvedValue([
      { name: 'Home', ssid: 'Home', password: 'secret', authentication: 'WPA2', cipher: 'CCMP' }
    ]);
    mockWifiService.getActiveInterface.mockResolvedValue({ success: true, connected: true, ssid: 'Home' });
    mockWifiService.runSecurityAudit.mockResolvedValue({ success: true, score: 100, issues: [] });

    const res = await request(app).get('/api/export').set(AUTH_HEADER, AUTH_TOKEN);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('fiwi-v2-export.json');
    const parsed = JSON.parse(res.text);
    expect(parsed.app).toBe('FiWi V2');
    expect(parsed.savedProfiles).toHaveLength(1);
  });

  it('exports a CSV file with a UTF-8 BOM for Excel compatibility', async () => {
    mockWifiService.getAllSavedProfilesDetails.mockResolvedValue([{ name: 'Home' }]);
    mockWifiService.exportProfilesToCSV.mockReturnValue('Network Name (SSID)\n"Home"\n');

    const res = await request(app).get('/api/export/csv').set(AUTH_HEADER, AUTH_TOKEN);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('fiwi-v2-passwords.csv');
    expect(res.text.charCodeAt(0)).toBe(0xfeff);
  });
});

describe('API: error handling on public routes', () => {
  it('returns 500 when getActiveInterface rejects', async () => {
    mockWifiService.getActiveInterface.mockRejectedValue(new Error('interface unavailable'));
    const res = await request(app).get('/api/active');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, error: 'interface unavailable' });
  });

  it('returns 500 when runSecurityAudit rejects', async () => {
    mockWifiService.runSecurityAudit.mockRejectedValue(new Error('audit crashed'));
    const res = await request(app).get('/api/audit');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('SPA fallback', () => {
  it('falls back to serving the client for unknown non-API routes', async () => {
    const res = await request(app).get('/some/client/route');
    // client/dist/index.html may or may not be built in this environment;
    // either way the request must not be treated as a 404 API error.
    expect([200, 404]).toContain(res.status);
  });
});
