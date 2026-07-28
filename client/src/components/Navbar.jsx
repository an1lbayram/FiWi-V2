import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Wifi, RefreshCw, Terminal, Download, ShieldCheck, Globe, Sun, Moon, FileSpreadsheet, FileJson } from 'lucide-react';

export default function Navbar({ activeConn, onRefresh, onFullScan, onExport, onToggleTerminal }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-panel navbar-header">
      <div className="navbar-container">
        
        {/* Brand Header */}
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <Wifi size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div className="navbar-brand-text">
            <h1 className="navbar-title">
              {t('appTitle')}
            </h1>
            <p className="navbar-subtitle">
              {t('subTitle')}
            </p>
            <a
              href="https://an1lbayram-github-io.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-author-link"
            >
              &lt;/&gt; Created by an1lbayram
            </a>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="status-badge-container">
          <span className="live-dot" style={{ backgroundColor: activeConn?.connected ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          <span className="status-label">
            {t('connectedAs')}:
          </span>
          <span className="status-value" style={{ color: activeConn?.connected ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
            {activeConn?.connected ? activeConn.ssid : t('notConnected')}
          </span>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          
          {/* Main Action CTAs */}
          <div className="navbar-primary-actions">
            <button className="btn-secondary flex-1" onClick={onRefresh} title={t('refresh')}>
              <RefreshCw size={16} />
              <span>{t('refresh')}</span>
            </button>

            <button className="btn-primary flex-1" onClick={onFullScan} title={t('fullAudit')}>
              <ShieldCheck size={16} />
              <span>{t('fullAudit')}</span>
            </button>
          </div>

          {/* Utility Toolbar Icons */}
          <div className="navbar-secondary-actions">
            <button
              className="btn-secondary icon-btn"
              onClick={() => onExport('json')}
              title={t('exportData') + ' (JSON)'}
            >
              <FileJson size={16} color="var(--accent-cyan)" />
              <span className="desktop-only">JSON</span>
            </button>

            <button
              className="btn-secondary icon-btn"
              onClick={() => onExport('csv')}
              title="Export CSV Passwords"
            >
              <FileSpreadsheet size={16} color="var(--accent-green)" />
              <span className="desktop-only">CSV</span>
            </button>

            <button className="btn-secondary icon-btn" onClick={onToggleTerminal} title={t('terminalLog')}>
              <Terminal size={16} color="var(--text-main)" />
              <span className="desktop-only">{t('terminalLog')}</span>
            </button>

            {/* Theme Switcher */}
            <button
              className="btn-secondary icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? (
                <Sun size={16} color="var(--accent-amber)" />
              ) : (
                <Moon size={16} color="var(--accent-purple)" />
              )}
              <span className="desktop-only">
                {theme === 'dark' ? t('lightMode') : t('darkMode')}
              </span>
            </button>

            {/* Language Switcher */}
            <button className="btn-secondary icon-btn" onClick={toggleLanguage} title="Switch Language">
              <Globe size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: '800' }}>{lang}</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}

