const { exec, spawn } = require('child_process');
const qrcode = require('qrcode');

/**
 * Execute PowerShell command with UTF-8 encoding support
 */
function execPowerShell(command, options = {}) {
  return new Promise((resolve, reject) => {
    const fullCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ${command}"`;
    exec(fullCmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10, ...options }, (error, stdout, stderr) => {
      if (error && !stdout) {
        return resolve({ error: error.message, stdout: '', stderr });
      }
      resolve({ stdout: stdout || '', stderr: stderr || '', error: null });
    });
  });
}

/**
 * Clean & normalize strings extracted from Windows command output
 */
function cleanValue(str) {
  if (!str) return '';
  return str.replace(/\r/g, '').trim();
}

/**
 * Get list of saved Wi-Fi profiles
 */
async function getSavedProfiles() {
  const { stdout, error } = await execPowerShell('netsh wlan show profiles');
  if (error && !stdout) {
    return { success: false, profiles: [], message: error };
  }

  const profiles = [];
  const lines = stdout.split('\n');

  for (const line of lines) {
    if (line.includes(':')) {
      const parts = line.split(':');
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();

      // Matches "All User Profile", "Tüm Kullanıcı Profili", etc.
      if (
        key.toLowerCase().includes('profile') ||
        key.toLowerCase().includes('profili') ||
        key.toLowerCase().includes('user profile')
      ) {
        if (val && !profiles.includes(val)) {
          profiles.push(val);
        }
      }
    }
  }

  return { success: true, profiles };
}

/**
 * Get details & cleartext password for a specific saved Wi-Fi profile
 */
async function getProfileDetails(profileName) {
  // Escape double quotes and backslashes for PowerShell safety
  const safeName = profileName.replace(/["`$\\]/g, '`$&');
  const { stdout, error } = await execPowerShell(`netsh wlan show profile name="${safeName}" key=clear`);

  if (error && !stdout) {
    return { success: false, error: error };
  }

  let ssid = profileName;
  let password = null;
  let authentication = 'Unknown';
  let cipher = 'Unknown';
  let securityKeyStatus = 'Unknown';
  let connectionType = 'ESS';

  const lines = stdout.split('\n');

  for (const line of lines) {
    if (!line.includes(':')) continue;
    const parts = line.split(':');
    const key = parts[0].trim().toLowerCase();
    const val = parts.slice(1).join(':').trim();

    if (key.includes('ssid name') || key.includes('ssid adı')) {
      ssid = val.replace(/^"|"$/g, '');
    } else if (key.includes('authentication') || key.includes('kimlik doğrulaması')) {
      authentication = val;
    } else if (key.includes('cipher') || key.includes('şifreleme')) {
      cipher = val;
    } else if (key.includes('security key') || key.includes('güvenlik anahtarı')) {
      securityKeyStatus = val;
    } else if (
      key.includes('key content') ||
      key.includes('anahtar içeriği') ||
      key.includes('passphrase')
    ) {
      password = val;
    } else if (key.includes('type') || key.includes('türü')) {
      if (val.includes('Infrastructure') || val.includes('Altyapı')) {
        connectionType = 'Infrastructure';
      }
    }
  }

  // Generate QR Code if password is known or network is open
  let qrCodeDataUrl = null;
  let qrPayload = '';
  
  if (password) {
    let authType = 'WPA';
    if (authentication.toUpperCase().includes('WEP')) authType = 'WEP';
    else if (authentication.toUpperCase().includes('OPEN') || authentication.toUpperCase().includes('AÇIK')) authType = 'nopass';
    
    qrPayload = `WIFI:S:${ssid};T:${authType};P:${password};;`;
  } else if (authentication.toUpperCase().includes('OPEN') || authentication.toUpperCase().includes('AÇIK')) {
    qrPayload = `WIFI:S:${ssid};T:nopass;;;`;
  }

  if (qrPayload) {
    try {
      qrCodeDataUrl = await qrcode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#00f2fe',
          light: '#0a0f1d'
        }
      });
    } catch (e) {
      console.error('QR Generation failed:', e);
    }
  }

  return {
    success: true,
    name: profileName,
    ssid,
    password,
    authentication,
    cipher,
    securityKeyStatus,
    connectionType,
    qrCodeDataUrl,
    qrPayload
  };
}

/**
 * Get all saved Wi-Fi profiles with details in batch
 */
async function getAllSavedProfilesDetails() {
  const { profiles } = await getSavedProfiles();
  const results = [];

  for (const name of profiles) {
    const details = await getProfileDetails(name);
    if (details.success) {
      results.push(details);
    }
  }

  return results;
}

/**
 * Forget/Delete a Wi-Fi profile
 */
async function deleteProfile(profileName) {
  const safeName = profileName.replace(/["`$\\]/g, '`$&');
  const { stdout, error } = await execPowerShell(`netsh wlan delete profile name="${safeName}"`);
  if (error && !stdout) {
    return { success: false, message: error };
  }
  return { success: true, message: stdout.trim() };
}

/**
 * Get active connected Wi-Fi interface status
 */
async function getActiveInterface() {
  const { stdout, error } = await execPowerShell('netsh wlan show interfaces');
  if (error && !stdout) {
    return { success: false, connected: false, message: error };
  }

  let connected = false;
  let name = '';
  let ssid = '';
  let bssid = '';
  let radioType = '';
  let authentication = '';
  let cipher = '';
  let connectionMode = '';
  let channel = '';
  let receiveRate = '';
  let transmitRate = '';
  let signal = '0%';
  let state = '';

  const lines = stdout.split('\n');
  for (const line of lines) {
    if (!line.includes(':')) continue;
    const parts = line.split(':');
    const key = parts[0].trim().toLowerCase();
    const val = parts.slice(1).join(':').trim();

    if (key.includes('name') && !name) {
      name = val;
    } else if (key.includes('state') || key.includes('durum')) {
      state = val;
      if (val.toLowerCase().includes('connected') || val.toLowerCase().includes('bağlandı')) {
        connected = true;
      }
    } else if (key.includes('ssid') && !key.includes('bssid')) {
      ssid = val;
    } else if (key.includes('bssid')) {
      bssid = val;
    } else if (key.includes('radio type') || key.includes('Radyo türü')) {
      radioType = val;
    } else if (key.includes('authentication') || key.includes('kimlik doğrulaması')) {
      authentication = val;
    } else if (key.includes('cipher') || key.includes('şifreleme')) {
      cipher = val;
    } else if (key.includes('channel') || key.includes('kanal')) {
      channel = val;
    } else if (key.includes('receive rate') || key.includes('alma hızı')) {
      receiveRate = val;
    } else if (key.includes('transmit rate') || key.includes('iletim hızı')) {
      transmitRate = val;
    } else if (key.includes('signal') || key.includes('sinyal')) {
      signal = val;
    }
  }

  // Also query IPConfig details for IP, Subnet, Gateway, DNS
  const ipInfo = await getIpConfigDetails();

  return {
    success: true,
    connected,
    name,
    ssid,
    bssid,
    radioType,
    authentication,
    cipher,
    channel,
    receiveRate,
    transmitRate,
    signal,
    state,
    ...ipInfo
  };
}

/**
 * Get IP configuration (IP, Subnet, Gateway, DNS, Public IP)
 */
async function getIpConfigDetails() {
  const { stdout } = await execPowerShell(`
    Get-NetIPConfiguration | Select-Object -First 1 | ForEach-Object {
      [PSCustomObject]@{
        InterfaceAlias = $_.InterfaceAlias
        IPv4Address = ($_.IPv4Address.IPAddress -join ', ')
        IPv4DefaultGateway = ($_.IPv4DefaultGateway.NextHop -join ', ')
        DNSServer = ($_.DNSServerServerAddresses.ServerAddresses -join ', ')
      }
    } | ConvertTo-Json
  `);

  let parsed = {};
  try {
    if (stdout.trim()) {
      parsed = JSON.parse(stdout.trim());
    }
  } catch (e) {
    // Fallback if JSON parse fails
  }

  return {
    ipv4: parsed.IPv4Address || 'N/A',
    gateway: parsed.IPv4DefaultGateway || 'N/A',
    dns: parsed.DNSServer || 'N/A',
    adapterAlias: parsed.InterfaceAlias || 'Wi-Fi'
  };
}

/**
 * Scan in-range Wi-Fi networks
 */
async function scanNearbyNetworks() {
  const { stdout, error } = await execPowerShell('netsh wlan show networks mode=bssid');
  if (error && !stdout) {
    return { success: false, networks: [], message: error };
  }

  const networks = [];
  let currentNet = null;
  let currentBssid = null;

  const lines = stdout.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.toLowerCase().startsWith('ssid') && !trimmed.toLowerCase().startsWith('bssid')) {
      if (currentNet) {
        if (currentBssid) currentNet.bssids.push(currentBssid);
        networks.push(currentNet);
      }
      const parts = trimmed.split(':');
      const ssidName = parts.slice(1).join(':').trim() || '(Hidden SSID)';
      currentNet = {
        ssid: ssidName,
        networkType: 'Infrastructure',
        authentication: 'Unknown',
        encryption: 'Unknown',
        bssids: []
      };
      currentBssid = null;
    } else if (currentNet) {
      if (trimmed.includes(':')) {
        const parts = trimmed.split(':');
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(':').trim();

        if (key.includes('network type') || key.includes('ağ türü')) {
          currentNet.networkType = val;
        } else if (key.includes('authentication') || key.includes('kimlik doğrulaması')) {
          currentNet.authentication = val;
        } else if (key.includes('encryption') || key.includes('şifreleme')) {
          currentNet.encryption = val;
        } else if (key.startsWith('bssid')) {
          if (currentBssid) {
            currentNet.bssids.push(currentBssid);
          }
          currentBssid = {
            mac: val,
            signal: '0%',
            radioType: 'Unknown',
            channel: '1'
          };
        } else if (currentBssid) {
          if (key.includes('signal') || key.includes('sinyal')) {
            currentBssid.signal = val;
          } else if (key.includes('radio type') || key.includes('radyo türü')) {
            currentBssid.radioType = val;
          } else if (key.includes('channel') || key.includes('kanal')) {
            currentBssid.channel = val;
          }
        }
      }
    }
  }

  if (currentNet) {
    if (currentBssid) currentNet.bssids.push(currentBssid);
    networks.push(currentNet);
  }

  // Calculate channel usage stats and recommended channel
  const channelCounts = {};
  networks.forEach(net => {
    net.bssids.forEach(b => {
      const ch = parseInt(b.channel, 10);
      if (!isNaN(ch)) {
        channelCounts[ch] = (channelCounts[ch] || 0) + 1;
      }
    });
  });

  // Recommended 2.4GHz channel out of 1, 6, 11
  const bgChannels = [1, 6, 11];
  let recommended24 = 1;
  let minCount24 = Infinity;
  bgChannels.forEach(ch => {
    const cnt = channelCounts[ch] || 0;
    if (cnt < minCount24) {
      minCount24 = cnt;
      recommended24 = ch;
    }
  });

  // Recommended 5GHz channel out of 36, 40, 44, 48, 149, 153, 157, 161
  const fiveGhzChannels = [36, 40, 44, 48, 149, 153, 157, 161];
  let recommended5g = 36;
  let minCount5g = Infinity;
  fiveGhzChannels.forEach(ch => {
    const cnt = channelCounts[ch] || 0;
    if (cnt < minCount5g) {
      minCount5g = cnt;
      recommended5g = ch;
    }
  });

  return {
    success: true,
    totalNetworks: networks.length,
    networks,
    channelCounts,
    recommendations: {
      recommended24GHz: recommended24,
      recommended5GHz: recommended5g
    }
  };
}

/**
 * Scan ARP table for local network devices
 */
async function scanLocalDevices() {
  const { stdout, error } = await execPowerShell('arp -a');
  if (error && !stdout) {
    return { success: false, devices: [], message: error };
  }

  const devices = [];
  const lines = stdout.split('\n');

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 3) {
      const ip = parts[0];
      const mac = parts[1];
      const type = parts[2];

      // Check if IP is IPv4 format
      if (ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) && mac.includes('-')) {
        // Skip broadcast & multicast addresses
        if (ip.endsWith('.255') || ip.startsWith('224.') || ip.startsWith('239.')) continue;

        let vendor = lookupMacVendor(mac);

        devices.push({
          ip,
          mac: mac.toUpperCase(),
          type: type || 'dynamic',
          vendor
        });
      }
    }
  }

  return { success: true, count: devices.length, devices };
}

/**
 * Basic MAC Vendor prefix lookup helper
 */
function lookupMacVendor(mac) {
  const cleanMac = mac.replace(/[:-]/g, '').substring(0, 6).toUpperCase();
  const knownVendors = {
    '005056': 'VMware',
    '000C29': 'VMware',
    '001C42': 'Parallels',
    '080027': 'VirtualBox',
    'B827EB': 'Raspberry Pi Foundation',
    'DCA632': 'Raspberry Pi Foundation',
    'E45F01': 'Raspberry Pi Foundation',
    '001A11': 'Google',
    'F88FCA': 'Google',
    'D8E0E1': 'Apple',
    'F4D488': 'Apple',
    'ACDE48': 'Apple',
    'A45E60': 'Apple',
    '3C52A1': 'Intel',
    '644C76': 'Intel',
    '88B111': 'Intel',
    '00155D': 'Microsoft (Hyper-V)',
    'E0D55E': 'Samsung',
    '842519': 'Samsung',
    '704D7B': 'TP-Link',
    '50C7BF': 'TP-Link',
    '18D6C7': 'TP-Link',
    '647002': 'TP-Link',
    '8C97EA': 'Xiaomi',
    '640980': 'Xiaomi',
    '50EC50': 'ASUSTek',
    '04D9F5': 'ASUSTek'
  };

  return knownVendors[cleanMac] || 'Generic Device';
}

/**
 * Ping host to measure real-time latency
 */
async function pingHost(host = '8.8.8.8') {
  const safeHost = host.replace(/[^a-zA-Z0-9.-]/g, '');
  const { stdout } = await execPowerShell(`Test-Connection -ComputerName "${safeHost}" -Count 1 | Select-Object -ExpandProperty ResponseTime`);
  
  const pingMs = parseInt(stdout.trim(), 10);
  return {
    host,
    latency: isNaN(pingMs) ? null : pingMs,
    online: !isNaN(pingMs)
  };
}

/**
 * Perform Security Audit on Saved Wi-Fi Profiles
 */
async function runSecurityAudit() {
  const profiles = await getAllSavedProfilesDetails();
  
  let score = 100;
  const issues = [];
  const recommendations = [];

  for (const prof of profiles) {
    const auth = (prof.authentication || '').toUpperCase();
    const pass = prof.password || '';

    // Check Open Networks
    if (auth.includes('OPEN') || auth.includes('AÇIK') || (!pass && !auth.includes('ENTERPRISE'))) {
      score -= 25;
      issues.push({
        severity: 'HIGH',
        profile: prof.ssid,
        issue: 'Open Network without Password Protection',
        detail: 'This network does not use encryption. Data transmitted can be intercepted.'
      });
      recommendations.push(`Avoid storing or automatically connecting to unencrypted open network "${prof.ssid}".`);
    }

    // Check WEP Security
    if (auth.includes('WEP')) {
      score -= 30;
      issues.push({
        severity: 'CRITICAL',
        profile: prof.ssid,
        issue: 'Deprecated WEP Encryption',
        detail: 'WEP is severely outdated and can be cracked in seconds.'
      });
      recommendations.push(`Remove network "${prof.ssid}" or update router security to WPA2/WPA3.`);
    }

    // Check Password Weakness
    if (pass) {
      if (pass.length < 8) {
        score -= 15;
        issues.push({
          severity: 'MEDIUM',
          profile: prof.ssid,
          issue: 'Weak Password Length (< 8 characters)',
          detail: 'Short passwords are vulnerable to brute-force dictionary attacks.'
        });
      } else if (/^(12345678|password|qwerty123|admin123|123456789|0123456789)$/i.test(pass)) {
        score -= 20;
        issues.push({
          severity: 'HIGH',
          profile: prof.ssid,
          issue: 'Common Dictionary Password',
          detail: 'The password is a well-known default passphrase.'
        });
        recommendations.push(`Change the Wi-Fi password for "${prof.ssid}" to a strong, unique passphrase.`);
      }
    }

    // Check Default Router SSID Names
    if (/^(tp-link|zyxel|superonline|ttnet|net-speed|tenda|asus|huawei|d-link|netgear)_[a-z0-9]+/i.test(prof.ssid || '')) {
      score -= 5;
      issues.push({
        severity: 'LOW',
        profile: prof.ssid,
        issue: 'Default Factory Router Name (SSID)',
        detail: 'Using factory SSID alerts attackers to the specific router make and potential unpatched hardware vulnerabilities.'
      });
      recommendations.push(`Consider renaming network "${prof.ssid}" to a custom non-identifying SSID name.`);
    }
  }

  // Ensure score stays between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let grade = 'A+';
  if (score < 60) grade = 'F';
  else if (score < 75) grade = 'C';
  else if (score < 88) grade = 'B';
  else if (score < 95) grade = 'A';

  return {
    success: true,
    score,
    grade,
    totalProfiles: profiles.length,
    issues,
    recommendations
  };
}

/**
 * Generate CSV string from Wi-Fi profiles list
 */
function exportProfilesToCSV(profiles) {
  let csv = 'Network Name (SSID),Authentication,Cipher,Password,Security Status\n';
  profiles.forEach(p => {
    const ssid = `"${(p.ssid || p.name).replace(/"/g, '""')}"`;
    const auth = `"${(p.authentication || '').replace(/"/g, '""')}"`;
    const cipher = `"${(p.cipher || '').replace(/"/g, '""')}"`;
    const pass = `"${(p.password || '').replace(/"/g, '""')}"`;
    const sec = `"${(p.securityKeyStatus || '').replace(/"/g, '""')}"`;
    csv += `${ssid},${auth},${cipher},${pass},${sec}\n`;
  });
  return csv;
}

module.exports = {
  getSavedProfiles,
  getProfileDetails,
  getAllSavedProfilesDetails,
  deleteProfile,
  getActiveInterface,
  scanNearbyNetworks,
  scanLocalDevices,
  pingHost,
  runSecurityAudit,
  exportProfilesToCSV
};
