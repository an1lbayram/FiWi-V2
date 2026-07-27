import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { KeyRound, Activity, Radio, Cpu, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'passwords', label: t('tabPasswords'), icon: KeyRound },
    { id: 'active', label: t('tabActive'), icon: Activity },
    { id: 'nearby', label: t('tabNearby'), icon: Radio },
    { id: 'devices', label: t('tabDevices'), icon: Cpu },
    { id: 'audit', label: t('tabAudit'), icon: ShieldAlert }
  ];

  return (
    <aside className="glass-panel" style={{ padding: '16px', height: 'fit-content' }}>
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={isActive ? 'active-tab' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15))'
                  : 'transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '4px solid var(--accent-cyan)' : '4px solid transparent',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
