import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QrCode, Download, X } from 'lucide-react';

export default function QRModal({ profile, onClose }) {
  const { t } = useLanguage();
  if (!profile) return null;

  const handleDownload = () => {
    if (!profile.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = profile.qrCodeDataUrl;
    a.download = `FiWi-${profile.ssid || profile.name}-QR.png`;
    a.click();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '20px', position: 'relative', textAlign: 'center', margin: 'auto' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'rgba(0, 242, 254, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <QrCode size={24} color="var(--accent-cyan)" />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px', wordBreak: 'break-all' }}>
          {profile.ssid || profile.name}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          {t('qrModalSub')}
        </p>

        {profile.qrCodeDataUrl ? (
          <div style={{
            background: '#fff',
            padding: '14px',
            borderRadius: '16px',
            display: 'inline-block',
            boxShadow: '0 0 25px rgba(0, 242, 254, 0.3)',
            marginBottom: '18px',
            maxWidth: '100%'
          }}>
            <img src={profile.qrCodeDataUrl} alt="Wi-Fi QR Code" style={{ width: '200px', height: '200px', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
        ) : (
          <div style={{ padding: '16px', color: 'var(--accent-amber)', fontSize: '0.85rem' }}>
            QR Code unavailable for this profile.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="btn-primary" onClick={handleDownload} disabled={!profile.qrCodeDataUrl} style={{ width: '100%' }}>
            <Download size={16} />
            <span>{t('downloadQR')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
