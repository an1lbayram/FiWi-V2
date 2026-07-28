import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PasswordsTab from './components/PasswordsTab';
import ActiveStatusTab from './components/ActiveStatusTab';
import NearbyScanTab from './components/NearbyScanTab';
import NetworkDevicesTab from './components/NetworkDevicesTab';
import AuditTab from './components/AuditTab';
import QRModal from './components/QRModal';
import TerminalModal from './components/TerminalModal';

import './App.css';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('passwords');
  
  const [profiles, setProfiles] = useState([]);
  const [activeConn, setActiveConn] = useState(null);
  const [nearbyData, setNearbyData] = useState(null);
  const [devicesData, setDevicesData] = useState(null);
  const [auditData, setAuditData] = useState(null);

  const [logs, setLogs] = useState([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedQRProfile, setSelectedQRProfile] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3002');
    setSocket(newSocket);

    newSocket.on('log', (logObj) => {
      setLogs(prev => [...prev, logObj]);
    });

    newSocket.on('scan-complete', (data) => {
      if (data.profiles) setProfiles(data.profiles);
      if (data.active) setActiveConn(data.active);
      if (data.nearby) setNearbyData(data.nearby);
      if (data.audit) setAuditData(data.audit);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchAllData = async (force = false) => {
    try {
      const q = force ? '?force=true' : '';
      
      const [resProf, resAct, resNear, resDev, resAud] = await Promise.all([
        fetch(`/api/profiles${q}`).then(r => r.json()),
        fetch(`/api/active`).then(r => r.json()),
        fetch(`/api/nearby${q}`).then(r => r.json()),
        fetch(`/api/devices`).then(r => r.json()),
        fetch(`/api/audit`).then(r => r.json())
      ]);

      if (resProf.success) setProfiles(resProf.profiles);
      if (resAct.success) setActiveConn(resAct);
      if (resNear.networks) setNearbyData(resNear);
      if (resDev.devices) setDevicesData(resDev);
      if (resAud.success) setAuditData(resAud);
    } catch (err) {
      console.error('Failed to fetch data from FiWi V2 server:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFullScan = () => {
    setIsTerminalOpen(true);
    if (socket) {
      socket.emit('run-full-scan');
    }
  };

  const handleDeleteProfile = async (name) => {
    try {
      const res = await fetch('/api/profiles/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      }).then(r => r.json());

      if (res.success) {
        setLogs(prev => [...prev, { text: `[✓] Removed profile ${name}\n` }]);
        fetchAllData(true);
      }
    } catch (e) {
      console.error('Failed to delete profile:', e);
    }
  };

  const handleExport = (type = 'json') => {
    if (type === 'csv') {
      window.location.href = '/api/export/csv';
    } else {
      window.location.href = '/api/export';
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="app-container">
          
          {/* Navbar */}
          <Navbar
            activeConn={activeConn}
            onRefresh={() => fetchAllData(true)}
            onFullScan={handleFullScan}
            onExport={handleExport}
            onToggleTerminal={() => setIsTerminalOpen(true)}
          />

          {/* Main Grid Layout */}
          <div className="app-grid">
            
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <main>
              {activeTab === 'passwords' && (
                <PasswordsTab
                  profiles={profiles}
                  onDeleteProfile={handleDeleteProfile}
                  onOpenQR={(prof) => setSelectedQRProfile(prof)}
                />
              )}

              {activeTab === 'active' && (
                <ActiveStatusTab activeConn={activeConn} socket={socket} />
              )}

              {activeTab === 'nearby' && (
                <NearbyScanTab nearbyData={nearbyData} onRescan={() => fetchAllData(true)} />
              )}

              {activeTab === 'devices' && (
                <NetworkDevicesTab devicesData={devicesData} />
              )}

              {activeTab === 'audit' && (
                <AuditTab auditData={auditData} />
              )}
            </main>

          </div>

          {/* Footer */}
          <footer className="glass-panel" style={{ marginTop: '40px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              FiWi V2 © 2026 — Web Based Wi-Fi & Network Intelligence Manager
            </span>
            <a
              href="https://an1lbayram-github-io.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px solid var(--border-color)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-mono)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 242, 254, 0.25)';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 242, 254, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 242, 254, 0.1)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              &lt;/&gt; Created by an1lbayram
            </a>
          </footer>

          {/* Modals */}
          {selectedQRProfile && (
            <QRModal profile={selectedQRProfile} onClose={() => setSelectedQRProfile(null)} />
          )}

          {isTerminalOpen && (
            <TerminalModal
              logs={logs}
              onClear={() => setLogs([])}
              onClose={() => setIsTerminalOpen(false)}
            />
          )}

        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
