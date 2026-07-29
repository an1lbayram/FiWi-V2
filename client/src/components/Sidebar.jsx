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
    <aside className="glass-panel sidebar-panel">
      <nav className="sidebar-nav">
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
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15))'
                  : 'transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontSize: '0.88rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

