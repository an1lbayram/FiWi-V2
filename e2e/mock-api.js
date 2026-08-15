// Installs deterministic /api/* responses so the client E2E suite (which
// only runs the built React app, not the real Windows-only Express server)
// renders a populated, stable UI to test against.
async function mockApi(page) {
  const profiles = [
    {
      name: 'HomeNetwork',
      ssid: 'HomeNetwork',
      password: 'SuperSecret123',
      authentication: 'WPA2-Personal',
      cipher: 'CCMP',
      connectionType: 'Infrastructure',
      qrCodeDataUrl: null,
      qrPayload: 'WIFI:S:HomeNetwork;T:WPA;P:SuperSecret123;;'
    },
    {
      name: 'CafeOpen',
      ssid: 'CafeOpen',
      password: null,
      authentication: 'Open',
      cipher: 'None',
      connectionType: 'Infrastructure',
      qrCodeDataUrl: null,
      qrPayload: 'WIFI:S:CafeOpen;T:nopass;;;'
    }
  ];

  const active = {
    success: true,
    connected: true,
    name: 'Wi-Fi',
    // Deliberately not a substring/superstring of any saved-profile SSID
    // above, so `getByText('HomeNetwork')` in tests can't ambiguously match
    // both the passwords-tab card and the navbar's active-connection badge.
    ssid: 'CompanySite-Guest',
    bssid: 'AA:BB:CC:DD:EE:FF',
    radioType: '802.11ac',
    authentication: 'WPA2-Personal',
    cipher: 'CCMP',
    channel: '36',
    receiveRate: '866',
    transmitRate: '866',
    signal: '92%',
    state: 'connected',
    ipv4: '192.168.1.42',
    gateway: '192.168.1.1',
    dns: '1.1.1.1',
    adapterAlias: 'Wi-Fi'
  };

  const nearby = {
    success: true,
    cached: false,
    totalNetworks: 1,
    networks: [
      {
        ssid: 'HomeNetwork',
        networkType: 'Infrastructure',
        authentication: 'WPA2-Personal',
        encryption: 'CCMP',
        bssids: [{ mac: 'AA:BB:CC:DD:EE:FF', signal: '92%', radioType: '802.11ac', channel: '36' }]
      }
    ],
    channelCounts: { 36: 1 },
    recommendations: { recommended24GHz: 6, recommended5GHz: 40 }
  };

  const devices = {
    success: true,
    count: 1,
    devices: [{ ip: '192.168.1.50', mac: 'D8:E0:E1:11:22:33', type: 'dynamic', vendor: 'Apple' }]
  };

  const audit = {
    success: true,
    score: 75,
    grade: 'C',
    totalProfiles: 2,
    issues: [
      {
        severity: 'HIGH',
        profile: 'CafeOpen',
        issue: 'Open Network without Password Protection',
        detail: 'This network does not use encryption. Data transmitted can be intercepted.'
      }
    ],
    recommendations: ['Avoid storing or automatically connecting to unencrypted open network "CafeOpen".']
  };

  await page.route('**/api/profiles**', (route) =>
    route.fulfill({ json: { success: true, cached: false, profiles } })
  );
  await page.route('**/api/active', (route) => route.fulfill({ json: active }));
  await page.route('**/api/nearby**', (route) => route.fulfill({ json: nearby }));
  await page.route('**/api/devices', (route) => route.fulfill({ json: devices }));
  await page.route('**/api/audit', (route) => route.fulfill({ json: audit }));
  await page.route('**/socket.io/**', (route) => route.abort());
}

module.exports = { mockApi };
