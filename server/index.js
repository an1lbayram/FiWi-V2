const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const notifier = require('node-notifier');
const cron = require('node-cron');
const fs = require('fs');

const {
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
} = require('./wifiService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());

// Serve static frontend files from React client build
app.use(express.static(path.join(__dirname, '../client/dist')));

const PORT = 3002;

// Cache mechanism for fast response
const cache = {
  profiles: { data: null, timestamp: 0 },
  nearby: { data: null, timestamp: 0 },
  active: { data: null, timestamp: 0 }
};
const CACHE_TTL = 15 * 1000; // 15 seconds cache

// GET /api/profiles - Fetch all saved Wi-Fi profiles with details & passwords
app.get('/api/profiles', async (req, res) => {
  const force = req.query.force === 'true';
  if (!force && cache.profiles.data && (Date.now() - cache.profiles.timestamp < CACHE_TTL)) {
    return res.json({ success: true, cached: true, profiles: cache.profiles.data });
  }

  try {
    const profiles = await getAllSavedProfilesDetails();
    cache.profiles.data = profiles;
    cache.profiles.timestamp = Date.now();
    res.json({ success: true, cached: false, profiles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/profiles/:name - Details for specific profile
app.get('/api/profiles/:name', async (req, res) => {
  try {
    const details = await getProfileDetails(req.params.name);
    res.json(details);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/profiles/delete - Delete/Forget Wi-Fi profile
app.post('/api/profiles/delete', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Profile name is required' });

  try {
    const result = await deleteProfile(name);
    cache.profiles.data = null; // Invalidate cache
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/active - Get current connected Wi-Fi connection info
app.get('/api/active', async (req, res) => {
  try {
    const info = await getActiveInterface();
    res.json(info);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/nearby - Scan nearby Wi-Fi networks & channel advice
app.get('/api/nearby', async (req, res) => {
  const force = req.query.force === 'true';
  if (!force && cache.nearby.data && (Date.now() - cache.nearby.timestamp < CACHE_TTL)) {
    return res.json({ cached: true, ...cache.nearby.data });
  }

  try {
    const data = await scanNearbyNetworks();
    cache.nearby.data = data;
    cache.nearby.timestamp = Date.now();
    res.json({ cached: false, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/devices - Local network device scanner
app.get('/api/devices', async (req, res) => {
  try {
    const data = await scanLocalDevices();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/audit - Run Wi-Fi security audit
app.get('/api/audit', async (req, res) => {
  try {
    const audit = await runSecurityAudit();
    res.json(audit);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ping - Test network latency
app.get('/api/ping', async (req, res) => {
  const targets = ['8.8.8.8', '1.1.1.1', '9.9.9.9'];
  try {
    const results = await Promise.all(targets.map(host => pingHost(host)));
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export - Export all profiles & audit report as JSON
app.get('/api/export', async (req, res) => {
  try {
    const profiles = await getAllSavedProfilesDetails();
    const active = await getActiveInterface();
    const audit = await runSecurityAudit();

    const exportData = {
      app: 'FiWi V2',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      activeConnection: active,
      securityAudit: audit,
      savedProfiles: profiles.map(p => ({
        name: p.name,
        ssid: p.ssid,
        password: p.password,
        authentication: p.authentication,
        cipher: p.cipher
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="fiwi-v2-export.json"');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export/csv - Export saved profiles as CSV file
app.get('/api/export/csv', async (req, res) => {
  try {
    const profiles = await getAllSavedProfilesDetails();
    const csvData = exportProfilesToCSV(profiles);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="fiwi-v2-passwords.csv"');
    res.send('\uFEFF' + csvData); // Add UTF-8 BOM for Excel compatibility
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Real-time Socket.io connections & terminal logging
io.on('connection', (socket) => {
  console.log('⚡ FiWi V2 Web Client connected:', socket.id);

  let pingInterval = null;

  socket.on('start-ping-monitor', () => {
    if (pingInterval) clearInterval(pingInterval);

    socket.emit('log', { text: '[~] Real-time latency monitor started...\n' });

    pingInterval = setInterval(async () => {
      try {
        const res8 = await pingHost('8.8.8.8');
        const res1 = await pingHost('1.1.1.1');
        socket.emit('ping-update', {
          timestamp: new Date().toLocaleTimeString(),
          google: res8.latency,
          cloudflare: res1.latency
        });
      } catch (e) {
        // Silent catch for disconnects
      }
    }, 3000);
  });

  socket.on('stop-ping-monitor', () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  });

  socket.on('run-full-scan', async () => {
    socket.emit('log', { text: '[~] Initiating full system Wi-Fi & network audit...\n' });
    try {
      socket.emit('log', { text: '[1/4] Fetching saved Wi-Fi profiles & passwords...\n' });
      const profiles = await getAllSavedProfilesDetails();
      socket.emit('log', { text: `[✓] Found ${profiles.length} saved profiles.\n` });

      socket.emit('log', { text: '[2/4] Querying active interface status...\n' });
      const active = await getActiveInterface();
      socket.emit('log', { text: `[✓] Active Network: ${active.ssid || 'Disconnected'} (${active.signal || '0%'})\n` });

      socket.emit('log', { text: '[3/4] Scanning nearby Wi-Fi spectrum...\n' });
      const nearby = await scanNearbyNetworks();
      socket.emit('log', { text: `[✓] Discovered ${nearby.totalNetworks} in-range networks.\n` });

      socket.emit('log', { text: '[4/4] Executing security vulnerability audit...\n' });
      const audit = await runSecurityAudit();
      socket.emit('log', { text: `[✓] Audit Complete. Health Score: ${audit.score}/100 (${audit.grade})\n` });

      socket.emit('scan-complete', { profiles, active, nearby, audit });
    } catch (e) {
      socket.emit('log', { text: `[ERROR] Scan failed: ${e.message}\n`, error: true });
    }
  });

  socket.on('disconnect', () => {
    if (pingInterval) clearInterval(pingInterval);
    console.log('Client disconnected:', socket.id);
  });
});

// Fallback to index.html for React SPA router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 📶 FiWi V2 Server running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});

// Background Cron Job for Wi-Fi Security & Status Check (Runs every 1 hour)
cron.schedule('0 * * * *', async () => {
  console.log('[Background Audit] Checking Wi-Fi security...');
  try {
    const audit = await runSecurityAudit();
    if (audit.issues.length > 0) {
      notifier.notify({
        title: 'FiWi V2 - Security Alert',
        message: `Found ${audit.issues.length} potential security issues on your saved Wi-Fi networks!`,
        appID: 'FiWi V2'
      });
    }
  } catch (e) {
    // Silent catch
  }
});
