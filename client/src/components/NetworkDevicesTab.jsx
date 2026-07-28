import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Cpu, HardDrive, Laptop, Smartphone, Monitor } from 'lucide-react';

export default function NetworkDevicesTab({ devicesData }) {
  const { t } = useLanguage();
  const devices = devicesData?.devices || [];

  const getDeviceIcon = (vendor) => {
    const v = (vendor || '').toLowerCase();
    if (v.includes('apple') || v.includes('samsung') || v.includes('xiaomi')) return Smartphone;
    if (v.includes('intel') || v.includes('microsoft')) return Laptop;
    if (v.includes('vmware') || v.includes('virtualbox')) return Monitor;
    return HardDrive;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={20} color="var(--accent-cyan)" />
          <span>{t('activeDevices')}</span>
        </h3>
        <span className="badge badge-cyan">{devices.length} {t('activeDevices')}</span>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="glass-panel desktop-device-table" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
            <thead>
              <tr style={{ background: 'var(--table-head-bg)', borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 18px' }}>Device / Vendor</th>
                <th style={{ padding: '14px 18px' }}>{t('deviceIp')}</th>
                <th style={{ padding: '14px 18px' }}>{t('deviceMac')}</th>
                <th style={{ padding: '14px 18px' }}>{t('deviceType')}</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev, idx) => {
                const IconComponent = getDeviceIcon(dev.vendor);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--table-row-border)', fontSize: '0.88rem' }}>
                    
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'rgba(0, 242, 254, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-cyan)',
                          flexShrink: 0
                        }}>
                          <IconComponent size={18} />
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{dev.vendor}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }} className="mono">
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{dev.ip}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }} className="mono">
                      <span style={{ color: 'var(--text-muted)' }}>{dev.mac}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-cyan">{dev.type}</span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Device Cards View (< 640px) */}
      <div className="mobile-device-cards">
        {devices.map((dev, idx) => {
          const IconComponent = getDeviceIcon(dev.vendor);
          return (
            <div key={idx} className="glass-panel" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(0, 242, 254, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)',
                    border: '1px solid var(--border-color)',
                    flexShrink: 0
                  }}>
                    <IconComponent size={18} />
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {dev.vendor}
                    </h4>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      MAC: {dev.mac}
                    </span>
                  </div>
                </div>
                <span className="badge badge-cyan">{dev.type}</span>
              </div>

              <div style={{
                background: 'var(--bg-card-inner)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('deviceIp')}:</span>
                <span className="mono" style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                  {dev.ip}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

