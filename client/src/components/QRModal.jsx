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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '24px', position: 'relative', textAlign: 'center' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(0, 242, 254, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <QrCode size={26} color="var(--accent-cyan)" />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
          {profile.ssid || profile.name}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {t('qrModalSub')}
        </p>

        {profile.qrCodeDataUrl ? (
          <div style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '16px',
            display: 'inline-block',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.3)',
            marginBottom: '20px'
          }}>
            <img src={profile.qrCodeDataUrl} alt="Wi-Fi QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
          </div>
        ) : (
          <div style={{ padding: '20px', color: 'var(--accent-amber)' }}>
            QR Code unavailable for this profile.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="btn-primary" onClick={handleDownload} disabled={!profile.qrCodeDataUrl}>
            <Download size={16} />
            <span>{t('downloadQR')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
