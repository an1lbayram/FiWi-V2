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
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={20} color="var(--accent-cyan)" />
          <span>{t('activeDevices')}</span>
        </h3>
        <span className="badge badge-cyan">{devices.length} {t('activeDevices')}</span>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--table-head-bg)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 20px' }}>Device / Vendor</th>
                <th style={{ padding: '16px 20px' }}>{t('deviceIp')}</th>
                <th style={{ padding: '16px 20px' }}>{t('deviceMac')}</th>
                <th style={{ padding: '16px 20px' }}>{t('deviceType')}</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev, idx) => {
                const IconComponent = getDeviceIcon(dev.vendor);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--table-row-border)', fontSize: '0.9rem' }}>
                    
                    <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(0, 242, 254, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)'
                      }}>
                        <IconComponent size={18} />
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{dev.vendor}</span>
                    </td>

                    <td style={{ padding: '16px 20px' }} className="mono">
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{dev.ip}</span>
                    </td>

                    <td style={{ padding: '16px 20px' }} className="mono">
                      <span style={{ color: 'var(--text-muted)' }}>{dev.mac}</span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge badge-cyan">{dev.type}</span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
