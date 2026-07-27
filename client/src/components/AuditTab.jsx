import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, AlertTriangle, CheckCircle, Lock, ShieldAlert } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Score Header Card */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            {t('networkHealthScore')}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '6px' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: '900', color: getScoreColor(), lineHeight: '1' }}>
              {score}
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-muted)' }}>/ 100</span>
            <span className="badge" style={{ backgroundColor: `${getScoreColor()}20`, color: getScoreColor(), border: `1px solid ${getScoreColor()}`, fontSize: '1.1rem', padding: '6px 16px' }}>
              Grade {grade}
            </span>
          </div>
        </div>

        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          border: `6px solid ${getScoreColor()}`,
          boxShadow: `0 0 30px ${getScoreColor()}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-card-inner)'
        }}>
          <ShieldCheck size={44} color={getScoreColor()} />
        </div>
      </div>

      {/* Issues Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="var(--accent-amber)" />
          <span>{t('auditIssues')} ({issues.length})</span>
        </h3>

        {issues.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(0, 230, 118, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
            <CheckCircle color="var(--accent-green)" size={20} />
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: '600' }}>
              {t('noIssuesFound')}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {issues.map((iss, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'rgba(255, 82, 82, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 82, 82, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--accent-red)', fontSize: '0.95rem' }}>
                    [{iss.severity}] {iss.issue}
                  </span>
                  <span className="badge badge-amber">{iss.profile}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{iss.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={20} color="var(--accent-cyan)" />
            <span>{t('auditRecommendations')}</span>
          </h3>

          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ lineHeight: '1.5' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
