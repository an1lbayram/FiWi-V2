import { describe, it, expect, beforeEach } from 'vitest';

// wifiService.js is plain CommonJS, loaded here via `require()` under the
// hood — that require chain bypasses Vitest's ESM-only vi.mock() hooks, so
// mocking `child_process` with vi.mock() would silently fall through to the
// REAL netsh/arp/ping commands on whatever machine runs these tests.
//
// Instead, server/test/setup.js (a Vitest setupFile, runs before this file
// loads) replaces the real `child_process` module's exec/execFile with
// vi.fn() directly on the singleton object. Every caller anywhere in the
// process — including wifiService.js's own `require('child_process')` —
// shares that same singleton, so we just read the already-patched functions
// off it here instead of using vi.mock().
const { exec, execFile } = require('child_process');
import wifiService from '../wifiService.js';

function mockExecStdout(stdout) {
  exec.mockImplementation((cmd, opts, cb) => {
    cb(null, stdout, '');
  });
}

function mockExecFileStdout(stdout) {
  execFile.mockImplementation((file, args, opts, cb) => {
    cb(null, stdout, '');
  });
}

beforeEach(() => {
  exec.mockReset();
  execFile.mockReset();
});

describe('getSavedProfiles', () => {
  it('parses profile names out of "netsh wlan show profiles" output', async () => {
    mockExecStdout(
      'Profiles on interface Wi-Fi:\n\n' +
        'Group policy profiles (read only)\n' +
        '---------------------------------\n' +
        '    <None>\n\n' +
        'User profiles\n' +
        '-------------\n' +
        '    All User Profile     : HomeNetwork\n' +
        '    All User Profile     : Office_5G\n'
    );

    const result = await wifiService.getSavedProfiles();

    expect(result.success).toBe(true);
    expect(result.profiles).toEqual(['HomeNetwork', 'Office_5G']);
  });

  it('supports localized (Turkish) key labels', async () => {
    mockExecStdout('    Tüm Kullanıcı Profili   : Ev_Agi\n');

    const result = await wifiService.getSavedProfiles();

    expect(result.profiles).toEqual(['Ev_Agi']);
  });

  it('deduplicates repeated profile names', async () => {
    mockExecStdout(
      '    All User Profile     : Dup\n    All User Profile     : Dup\n'
    );

    const result = await wifiService.getSavedProfiles();

    expect(result.profiles).toEqual(['Dup']);
  });

  it('returns success:false when the command errors with no output', async () => {
    exec.mockImplementation((cmd, opts, cb) => {
      cb(new Error('netsh not found'), '', 'boom');
    });

    const result = await wifiService.getSavedProfiles();

    expect(result.success).toBe(false);
    expect(result.profiles).toEqual([]);
  });
});

describe('getProfileDetails', () => {
  it('parses SSID, auth, cipher and cleartext password', async () => {
    mockExecFileStdout(
      [
        'Profile HomeNetwork on interface Wi-Fi:',
        '',
        '    Applied: All User Profile',
        '',
        'Connectivity settings',
        '----------------------',
        '    SSID name                 : "HomeNetwork"',
        '    Network type              : Infrastructure',
        '    Connection mode           : Auto',
        '',
        'Security settings',
        '-------------------',
        '    Authentication            : WPA2-Personal',
        '    Cipher                    : CCMP',
        '    Security key              : Present',
        '    Key Content                : SuperSecret123',
        ''
      ].join('\n')
    );

    const details = await wifiService.getProfileDetails('HomeNetwork');

    expect(details.success).toBe(true);
    expect(details.ssid).toBe('HomeNetwork');
    expect(details.authentication).toBe('WPA2-Personal');
    expect(details.cipher).toBe('CCMP');
    expect(details.password).toBe('SuperSecret123');
    expect(details.qrPayload).toContain('P:SuperSecret123');
  });

  it('passes the untrusted profile name via env var, never concatenated into the command string', async () => {
    mockExecFileStdout('    SSID name : "x"\n');
    const maliciousName = '"; Remove-Item C:\\ -Recurse -Force; #';

    await wifiService.getProfileDetails(maliciousName);

    expect(execFile).toHaveBeenCalledTimes(1);
    const [file, args, opts] = execFile.mock.calls[0];

    // Uses execFile (no shell), so no metacharacter in the name can ever be
    // interpreted by cmd.exe or PowerShell's parser.
    expect(file).toBe('powershell.exe');
    expect(args).toContain('-EncodedCommand');

    // The encoded command text is fixed/hard-coded — it must not contain the
    // malicious value anywhere.
    const encodedIndex = args.indexOf('-EncodedCommand') + 1;
    const decoded = Buffer.from(args[encodedIndex], 'base64').toString('utf16le');
    expect(decoded).not.toContain(maliciousName);
    expect(decoded).toContain('$env:FIWI_PROFILE_NAME');

    // The value only ever travels as an environment variable.
    expect(opts.env.FIWI_PROFILE_NAME).toBe(maliciousName);
  });

  it('builds an open-network QR payload when there is no password but auth is Open', async () => {
    mockExecFileStdout(
      '    SSID name : "OpenNet"\n    Authentication : Open\n'
    );

    const details = await wifiService.getProfileDetails('OpenNet');

    expect(details.password).toBeNull();
    expect(details.qrPayload).toBe('WIFI:S:OpenNet;T:nopass;;;');
  });
});

describe('deleteProfile', () => {
  it('passes the profile name as an env var via execFile', async () => {
    mockExecFileStdout('Profile "X" is deleted.\n');

    const result = await wifiService.deleteProfile('X & echo pwned');

    expect(result.success).toBe(true);
    const [, , opts] = execFile.mock.calls[0];
    expect(opts.env.FIWI_PROFILE_NAME).toBe('X & echo pwned');
  });
});

describe('scanLocalDevices', () => {
  it('parses IPv4 ARP entries and skips broadcast/multicast addresses', async () => {
    mockExecStdout(
      [
        'Interface: 192.168.1.10 --- 0xb',
        '  Internet Address      Physical Address      Type',
        '  192.168.1.1           00-15-5d-00-15-5d     dynamic',
        '  192.168.1.255         ff-ff-ff-ff-ff-ff     static',
        '  224.0.0.22            01-00-5e-00-00-16     static',
        '  192.168.1.50          d8-e0-e1-11-22-33     dynamic'
      ].join('\n')
    );

    const result = await wifiService.scanLocalDevices();

    expect(result.count).toBe(2);
    const ips = result.devices.map((d) => d.ip);
    expect(ips).toEqual(['192.168.1.1', '192.168.1.50']);
    // MAC prefix 00155D belongs to Microsoft (Hyper-V) in the vendor table.
    expect(result.devices[0].vendor).toBe('Microsoft (Hyper-V)');
    expect(result.devices[1].vendor).toBe('Apple');
  });
});

describe('scanNearbyNetworks', () => {
  it('groups BSSIDs under networks and recommends the least-used channels', async () => {
    mockExecStdout(
      [
        'Interfaces there are 1 interfaces on the system:',
        '',
        'SSID 1 : NetworkA',
        '    Network type            : Infrastructure',
        '    Authentication          : WPA2-Personal',
        '    Encryption              : CCMP',
        '    BSSID 1                 : aa:aa:aa:aa:aa:aa',
        '         Signal             : 80%',
        '         Radio type         : 802.11ac',
        '         Channel            : 1',
        'SSID 2 : NetworkB',
        '    Network type            : Infrastructure',
        '    Authentication          : Open',
        '    Encryption              : None',
        '    BSSID 1                 : bb:bb:bb:bb:bb:bb',
        '         Signal             : 55%',
        '         Radio type         : 802.11n',
        '         Channel            : 6'
      ].join('\n')
    );

    const result = await wifiService.scanNearbyNetworks();

    expect(result.totalNetworks).toBe(2);
    expect(result.networks[0].ssid).toBe('NetworkA');
    expect(result.networks[0].bssids[0].channel).toBe('1');
    expect(result.channelCounts['1']).toBe(1);
    // Channel 11 is unused in this scan, so it must be recommended over
    // channels 1 and 6 which are both occupied.
    expect(result.recommendations.recommended24GHz).toBe(11);
  });
});

describe('pingHost', () => {
  it('parses latency (ms) from ping output and strips unsafe characters from the host', async () => {
    execFile.mockImplementation((cmd, args, opts, cb) => {
      expect(args[args.length - 1]).toBe('8.8.8.8touchtmppwned');
      cb(null, 'Reply from 8.8.8.8: bytes=32 time=12ms TTL=118', '');
    });

    const result = await wifiService.pingHost('8.8.8.8; touch /tmp/pwned');

    expect(result.online).toBe(true);
    expect(result.latency).toBe(12);
  });

  it('reports offline when there is no time= match (timeout/unreachable)', async () => {
    execFile.mockImplementation((cmd, args, opts, cb) => {
      cb(null, 'Request timed out.', '');
    });

    const result = await wifiService.pingHost('10.0.0.1');

    expect(result.online).toBe(false);
    expect(result.latency).toBeNull();
  });
});

describe('runSecurityAudit', () => {
  // runSecurityAudit() calls the module's own getAllSavedProfilesDetails(),
  // which in turn drives getSavedProfiles() (exec) and getProfileDetails()
  // per profile (execFile). Since those are plain internal function
  // references (not called via `module.exports.*`), they can't be
  // vi.spyOn'd from outside — so instead we drive the whole chain through
  // fake netsh output, keyed by profile name via the FIWI_PROFILE_NAME env var.
  async function auditFor(profiles) {
    mockExecStdout(profiles.map((p) => `    All User Profile     : ${p.name}\n`).join(''));

    execFile.mockImplementation((file, args, opts, cb) => {
      const p = profiles.find((pr) => pr.name === opts.env.FIWI_PROFILE_NAME);
      const lines = [`    SSID name : "${p.name}"`, `    Authentication : ${p.authentication}`];
      if (p.password) lines.push(`    Key Content : ${p.password}`);
      cb(null, lines.join('\n'), '');
    });

    return wifiService.runSecurityAudit();
  }

  it('gives a perfect score for a single strong WPA2 network', async () => {
    const result = await auditFor([
      { name: 'Home', authentication: 'WPA2-Personal', password: 'a-Strong-Passw0rd!' }
    ]);

    expect(result.score).toBe(100);
    expect(result.grade).toBe('A+');
    expect(result.issues).toHaveLength(0);
  });

  it('penalizes open networks, WEP, weak/common passwords and default SSIDs, clamped to 0', async () => {
    const result = await auditFor([
      { name: 'OpenCafe', authentication: 'Open', password: '' },
      { name: 'OldRouter', authentication: 'WEP', password: 'abc123' },
      { name: 'weakpass', authentication: 'WPA2-Personal', password: 'short1' },
      { name: 'dictionary', authentication: 'WPA2-Personal', password: 'password' },
      { name: 'TP-Link_A1B2', authentication: 'WPA2-Personal', password: 'longenoughpassword' }
    ]);

    const severities = result.issues.map((i) => i.severity);
    expect(severities).toContain('HIGH'); // open network
    expect(severities).toContain('CRITICAL'); // WEP
    expect(severities).toContain('MEDIUM'); // short password
    expect(severities).toContain('LOW'); // default SSID
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('never lets the score go below 0 even with many issues', async () => {
    const manyBadProfiles = Array.from({ length: 10 }, (_, i) => ({
      name: `Open${i}`,
      authentication: 'WEP',
      password: ''
    }));

    const result = await auditFor(manyBadProfiles);

    expect(result.score).toBe(0);
    expect(result.grade).toBe('F');
  });
});

describe('exportProfilesToCSV', () => {
  it('produces a header row plus one escaped row per profile', () => {
    const csv = wifiService.exportProfilesToCSV([
      { ssid: 'Net "Home"', authentication: 'WPA2', cipher: 'CCMP', password: 'p"w', securityKeyStatus: 'Present' }
    ]);

    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('Network Name (SSID),Authentication,Cipher,Password,Security Status');
    // Embedded double-quotes must be doubled per RFC 4180 CSV escaping.
    expect(lines[1]).toBe('"Net ""Home""","WPA2","CCMP","p""w","Present"');
  });

  it('falls back to the profile name when ssid is missing', () => {
    const csv = wifiService.exportProfilesToCSV([{ name: 'FallbackName' }]);
    expect(csv).toContain('"FallbackName"');
  });
});
