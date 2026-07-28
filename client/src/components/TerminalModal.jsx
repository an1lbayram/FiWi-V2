import React, { useEffect, useRef } from 'react';
import { Terminal as TermIcon, X, Trash2 } from 'lucide-react';

export default function TerminalModal({ logs, onClear, onClose }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', height: 'clamp(320px, 75vh, 520px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0', margin: 'auto' }}>
        
        {/* Terminal Header */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(5, 10, 20, 0.9)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <TermIcon size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              FiWi V2 Live Terminal Output
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Clear Logs">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Terminal Log Output Window */}
        <div style={{
          flex: '1',
          padding: '14px',
          background: '#040711',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          color: '#00f2fe'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)' }}>
              [~] Terminal initialized. Ready for operations...
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} style={{ color: log.error ? 'var(--accent-red)' : '#00f2fe', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {log.text}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>

      </div>
    </div>
  );
}
