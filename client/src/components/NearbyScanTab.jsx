import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Radio, Signal, CheckCircle2, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export default function NearbyScanTab({ nearbyData, onRescan }) {
  const { t } = useLanguage();
  const [expandedSsid, setExpandedSsid] = useState(null);

  const networks = nearbyData?.networks || [];
  const rec = nearbyData?.recommendations || { recommended24GHz: 1, recommended5GHz: 36 };

  const toggleExpand = (ssid) => {
    setExpandedSsid(expandedSsid === ssid ? null : ssid);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Recommended Channel Advice Banner */}
      <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(127, 83, 172, 0.1))' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={22} color="var(--accent-cyan)" />
          <span>{t('recommendationTitle')}</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-card-inner)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('rec24GHz')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '1rem', padding: '4px 12px' }}>
                Channel {rec.recommended24GHz}
              </span>
              <CheckCircle2 size={18} color="var(--accent-green)" />
            </div>
          </div>

          <div style={{ background: 'var(--bg-card-inner)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('rec5GHz')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '1rem', padding: '4px 12px' }}>
                Channel {rec.recommended5GHz}
              </span>
              <CheckCircle2 size={18} color="var(--accent-green)" />
            </div>
          </div>
        </div>
      </div>

      {/* Header with counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={20} color="var(--accent-cyan)" />
          <span>{t('foundNetworks')}</span>
        </h3>
        <span className="badge badge-cyan">{networks.length} {t('foundNetworks')}</span>
      </div>

      {/* Network List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {networks.map((net) => {
          const isExpanded = expandedSsid === net.ssid;
          const primaryBssid = net.bssids[0] || {};
          const signalNum = parseInt(primaryBssid.signal || '0', 10);

          return (
            <div key={net.ssid} className="glass-panel" style={{ padding: '16px 20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <Signal color={signalNum > 60 ? 'var(--accent-green)' : signalNum > 30 ? 'var(--accent-amber)' : 'var(--accent-red)'} size={22} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-all' }}>{net.ssid}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {net.authentication} ({net.encryption})
                      </span>
                      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                        {net.bssids.length} AP(s)
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                  <span className="mono" style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-green)' }}>
                    {signalNum}%
                  </span>
                  {net.bssids.length > 0 && (
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 10px' }}
                      onClick={() => toggleExpand(net.ssid)}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </div>
              </div>

              {/* BSSIDs Details Drawer */}
              {isExpanded && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>{t('bssidDetails')}:</span>
                  {net.bssids.map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '8px 12px', background: 'var(--bg-card-inner)', borderRadius: '8px', fontSize: '0.82rem', border: '1px solid var(--border-color)' }}>
                      <span className="mono" style={{ color: 'var(--text-main)' }}>MAC: {b.mac}</span>
                      <span className="mono">Channel {b.channel} ({b.radioType})</span>
                      <span className="mono" style={{ color: 'var(--accent-green)' }}>{b.signal}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
