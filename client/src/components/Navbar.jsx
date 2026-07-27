import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Wifi, RefreshCw, Terminal, Download, ShieldCheck, Globe, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeConn, onRefresh, onFullScan, onExport, onToggleTerminal }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 16px 16px', marginBottom: '24px', padding: '16px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Wifi size={26} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', background: 'var(--gradient-heading)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>
              {t('subTitle')}
            </p>
            <a
              href="https://an1lbayram-github-io.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
                background: 'var(--badge-cyan-bg, rgba(0, 242, 254, 0.08))',
                border: '1px solid var(--border-color)',
                padding: '2px 8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-mono)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--border-color)';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--badge-cyan-bg, rgba(0, 242, 254, 0.08))';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              &lt;/&gt; Created by an1lbayram
            </a>
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          background: 'var(--bg-card-inner)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <span className="live-dot" style={{ backgroundColor: activeConn?.connected ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            {t('connectedAs')}:
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: activeConn?.connected ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
            {activeConn?.connected ? activeConn.ssid : t('notConnected')}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn-secondary" onClick={onRefresh} title={t('refresh')}>
            <RefreshCw size={16} />
            <span>{t('refresh')}</span>
          </button>

          <button className="btn-primary" onClick={onFullScan} title={t('fullAudit')}>
            <ShieldCheck size={16} />
            <span>{t('fullAudit')}</span>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="btn-secondary"
              onClick={() => onExport('json')}
              title={t('exportData')}
            >
              <Download size={16} />
              <span className="desktop-only">JSON Export</span>
            </button>
          </div>

          <button
            className="btn-secondary"
            onClick={() => onExport('csv')}
            title="Export CSV Passwords"
          >
            <Download size={16} color="var(--accent-green)" />
            <span className="desktop-only">CSV Export</span>
          </button>

          <button className="btn-secondary" onClick={onToggleTerminal} title={t('terminalLog')}>
            <Terminal size={16} />
          </button>

          {/* Theme Switcher Button */}
          <button
            className="btn-secondary"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            style={{ gap: '6px' }}
          >
            {theme === 'dark' ? (
              <Sun size={16} color="var(--accent-amber)" />
            ) : (
              <Moon size={16} color="var(--accent-purple)" />
            )}
            <span style={{ fontWeight: '700' }} className="desktop-only">
              {theme === 'dark' ? t('lightMode') : t('darkMode')}
            </span>
          </button>

          {/* Language Switcher */}
          <button className="btn-secondary" onClick={toggleLanguage} style={{ gap: '6px' }}>
            <Globe size={16} color="var(--accent-cyan)" />
            <span style={{ fontWeight: '800' }}>{lang}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
