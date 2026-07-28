import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Wifi, Signal, ArrowDown, ArrowUp, Network, Activity, Zap } from 'lucide-react';

export default function ActiveStatusTab({ activeConn, socket }) {
  const { t } = useLanguage();
  const [pingHistory, setPingHistory] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('start-ping-monitor');

    const handlePingUpdate = (data) => {
      setPingHistory(prev => {
        const next = [...prev, data];
        return next.slice(-15); // keep last 15 ticks
      });
    };

    socket.on('ping-update', handlePingUpdate);

    return () => {
      socket.off('ping-update', handlePingUpdate);
      socket.emit('stop-ping-monitor');
    };
  }, [socket]);

  const parseSignalInt = (sigStr) => {
    if (!sigStr) return 0;
    const match = sigStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const signalPercent = parseSignalInt(activeConn?.signal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Connected Wi-Fi Header Banner */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Wifi size={28} color="var(--accent-cyan)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>
              {activeConn?.connected ? 'Active Wi-Fi Connection' : 'No Connection'}
            </span>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: '800', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeConn?.connected ? activeConn.ssid : t('notConnected')}
            </h2>
            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              BSSID: {activeConn?.bssid || 'N/A'}
            </span>
          </div>
        </div>

        {/* Signal Progress Bar */}
        <div style={{ flex: '1 1 200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700' }}>
            <span>{t('signalStrength')}</span>
            <span style={{ color: 'var(--accent-green)' }}>{signalPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'var(--bg-card-inner)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{
              width: `${signalPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f2fe, #00e676)',
              borderRadius: '5px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Grid of Key Wi-Fi Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '14px' }}>
        
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Signal color="var(--accent-cyan)" size={22} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('radioProtocol')}</p>
            <p style={{ fontSize: '0.95rem', fontWeight: '700' }}>{activeConn?.radioType || '802.11ax'}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Zap color="var(--accent-amber)" size={22} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('channel')}</p>
            <p style={{ fontSize: '0.95rem', fontWeight: '700' }}>Channel {activeConn?.channel || '6'}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArrowDown color="var(--accent-green)" size={22} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('downloadSpeed')}</p>
            <p className="mono" style={{ fontSize: '0.95rem', fontWeight: '700' }}>{activeConn?.receiveRate || '144.4 Mbps'}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ArrowUp color="var(--accent-blue)" size={22} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('uploadSpeed')}</p>
            <p className="mono" style={{ fontSize: '0.95rem', fontWeight: '700' }}>{activeConn?.transmitRate || '144.4 Mbps'}</p>
          </div>
        </div>

      </div>

      {/* IP & Gateway Details */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Network size={20} color="var(--accent-cyan)" />
          <span>IP Configuration & Gateway</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('ipAddress')}</span>
            <p className="mono" style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-cyan)', marginTop: '4px' }}>
              {activeConn?.ipv4 || '192.168.1.100'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('gateway')}</span>
            <p className="mono" style={{ fontSize: '1rem', fontWeight: '700', marginTop: '4px' }}>
              {activeConn?.gateway || '192.168.1.1'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('dnsServer')}</span>
            <p className="mono" style={{ fontSize: '1rem', fontWeight: '700', marginTop: '4px' }}>
              {activeConn?.dns || '8.8.8.8, 1.1.1.1'}
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Latency Ping Graph */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--accent-green)" />
            <span>{t('latencyBenchmark')}</span>
          </h3>
          <span className="live-dot" />
        </div>

        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ height: '140px', minWidth: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            {pingHistory.map((item, idx) => {
              const ms = item.google || 20;
              const barHeight = Math.min(100, Math.max(15, ms * 1.5));
              return (
                <div key={idx} style={{ flex: '1', minWidth: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent-green)' }}>{ms}ms</span>
                  <div style={{
                    width: '100%',
                    height: `${barHeight}px`,
                    background: 'linear-gradient(180deg, var(--accent-green), rgba(0, 230, 118, 0.2))',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{item.timestamp?.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
