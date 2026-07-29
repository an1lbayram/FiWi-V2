import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

export default function AuditTab({ auditData }) {
  const { t } = useLanguage();

  const score = auditData?.score ?? 100;
  const grade = auditData?.grade ?? 'A+';
  const issues = auditData?.issues || [];
  const recommendations = auditData?.recommendations || [];

  const getScoreColor = () => {
    if (score >= 90) return 'var(--accent-green)';
    if (score >= 70) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {/* Score Header Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            {t('networkHealthScore')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: '900', color: getScoreColor(), lineHeight: '1' }}>
              {score}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-muted)' }}>/ 100</span>
            <span className="badge" style={{ backgroundColor: `${getScoreColor()}20`, color: getScoreColor(), border: `1px solid ${getScoreColor()}`, fontSize: '0.88rem', padding: '4px 10px' }}>
              Grade {grade}
            </span>
          </div>
        </div>

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: `4px solid ${getScoreColor()}`,
          boxShadow: `0 0 20px ${getScoreColor()}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-card-inner)',
          flexShrink: 0
        }}>
          <ShieldCheck size={32} color={getScoreColor()} />
        </div>
      </div>

      {/* Issues Section */}
      <div className="glass-panel" style={{ padding: '16px 20px', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="var(--accent-amber)" />
          <span>{t('auditIssues')} ({issues.length})</span>
        </h3>

        {issues.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', background: 'rgba(0, 230, 118, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
            <CheckCircle color="var(--accent-green)" size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: '600' }}>
              {t('noIssuesFound')}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issues.map((iss, idx) => (
              <div key={idx} style={{ padding: '12px', background: 'rgba(255, 82, 82, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 82, 82, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--accent-red)', fontSize: '0.88rem', wordBreak: 'break-word' }}>
                    [{iss.severity}] {iss.issue}
                  </span>
                  <span className="badge badge-amber">{iss.profile}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{iss.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px 20px', width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--accent-cyan)" />
            <span>{t('auditRecommendations')}</span>
          </h3>

          <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ lineHeight: '1.4' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

