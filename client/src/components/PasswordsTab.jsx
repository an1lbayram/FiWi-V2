import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Search, Eye, EyeOff, Copy, QrCode, Trash2, Shield, Lock, Unlock, Check } from 'lucide-react';

export default function PasswordsTab({ profiles, onDeleteProfile, onOpenQR }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleKeys, setVisibleKeys] = useState({});
  const [copiedName, setCopiedName] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toggleVisibility = (name) => {
    setVisibleKeys(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCopy = (name, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const filtered = profiles.filter(p =>
    (p.ssid || p.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Search & Summary Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Counter Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('totalSaved')}:</span>
          <span className="badge badge-cyan" style={{ fontSize: '0.9rem' }}>{profiles.length}</span>
        </div>
      </div>

      {/* Passwords Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map((prof) => {
          const isVisible = visibleKeys[prof.name];
          const hasPassword = Boolean(prof.password);
          const isCopied = copiedName === prof.name;

          return (
            <div key={prof.name} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              
              {/* Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: hasPassword ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 171, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: hasPassword ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid rgba(255, 171, 0, 0.2)'
                    }}>
                      {hasPassword ? <Lock size={18} color="var(--accent-cyan)" /> : <Unlock size={18} color="var(--accent-amber)" />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                        {prof.ssid || prof.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {prof.connectionType || 'Wi-Fi Profile'}
                      </span>
                    </div>
                  </div>

                  <span className={hasPassword ? 'badge badge-cyan' : 'badge badge-amber'}>
                    {prof.authentication || 'WPA2'}
                  </span>
                </div>
              </div>

              {/* Password Display Field */}
              <div style={{
                background: 'var(--bg-card-inner)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                {hasPassword ? (
                  <>
                    <span className="mono" style={{ fontSize: '0.95rem', letterSpacing: isVisible ? '0.5px' : '2px', color: isVisible ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      {isVisible ? prof.password : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => toggleVisibility(prof.name)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      title={isVisible ? t('hidePassword') : t('showPassword')}
                    >
                      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', italic: 'true' }}>
                    {t('noPassword')}
                  </span>
                )}
              </div>

              {/* Card Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasPassword && (
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleCopy(prof.name, prof.password)}
                    >
                      {isCopied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
                      <span>{isCopied ? t('copied') : t('copyPassword')}</span>
                    </button>
                  )}

                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => onOpenQR(prof)}
                  >
                    <QrCode size={14} color="var(--accent-cyan)" />
                    <span>{t('qrCode')}</span>
                  </button>
                </div>

                <button
                  className="btn-danger"
                  onClick={() => setDeleteTarget(prof)}
                  title={t('forgetNetwork')}
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--accent-red)' }}>
              {t('confirmDeleteTitle')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
              <strong>"{deleteTarget.ssid || deleteTarget.name}"</strong> {t('confirmDeleteBody')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                {t('cancel')}
              </button>
              <button className="btn-danger" onClick={() => {
                onDeleteProfile(deleteTarget.name);
                setDeleteTarget(null);
              }}>
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
