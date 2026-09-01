import React, { useState } from 'react';

export default function MajorityWarningModal({
  student,
  teamName,
  insideCount,
  totalCount,
  halfRequired,
  authorizers,
  onPermit,
  onDeny,
}) {
  const [step, setStep] = useState('warning'); // 'warning' | 'auth'
  const [authName, setAuthName] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  function handlePermit() {
    setStep('auth');
    setError('');
  }

  function handleSubmitAuth() {
    const trimmed = authName.trim();
    if (!trimmed) {
      setError('Please enter an authorizer name.');
      return;
    }

    setValidating(true);
    // Case-insensitive match
    const match = authorizers.some(
      a => a.toLowerCase() === trimmed.toLowerCase()
    );

    if (match) {
      onPermit(trimmed);
    } else {
      setError('Name not recognized. Request denied.');
      setTimeout(() => {
        onDeny();
      }, 1800);
    }
    setValidating(false);
  }

  return (
    <div className="modal-overlay" onClick={onDeny}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Icon + Title */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
        }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, fontWeight: 700,
            color: 'var(--amber)', letterSpacing: 2,
            textTransform: 'uppercase',
          }}>Majority-Out Warning</span>
        </div>

        {/* Rule explanation */}
        <div style={{
          fontSize: 14, color: 'var(--text2)', lineHeight: 1.6,
          marginBottom: 16, paddingLeft: 2,
        }}>
          Checking out <strong style={{ color: 'var(--text)' }}>{student?.name}</strong> would
          put more than half of <strong style={{ color: 'var(--amber)' }}>Team {teamName}</strong> outside.
        </div>

        <div style={{
          background: 'var(--amber-dim)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 8, padding: '12px 14px',
          marginBottom: 20,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: 'var(--amber2)', letterSpacing: 1,
          }}>
            Rule: At least <strong>{halfRequired}</strong> of <strong>{totalCount}</strong> members
            must remain inside. Currently <strong>{insideCount}</strong> inside.
          </div>
        </div>

        {step === 'warning' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={onDeny}
              style={{
                padding: '12px', borderRadius: 8,
                border: '1px solid var(--border2)',
                background: 'var(--bg3)',
                color: 'var(--text2)',
                fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700,
                letterSpacing: 1, cursor: 'pointer',
                transition: 'all 0.15s', textTransform: 'uppercase',
              }}
            >Deny</button>
            <button
              onClick={handlePermit}
              style={{
                padding: '12px', borderRadius: 8,
                border: '1px solid var(--amber)',
                background: 'var(--amber)',
                color: 'var(--bg)',
                fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700,
                letterSpacing: 1, cursor: 'pointer',
                transition: 'all 0.15s', textTransform: 'uppercase',
              }}
            >Permit</button>
          </div>
        )}

        {step === 'auth' && (
          <div style={{ animation: 'fadeUp 0.25s ease both' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, fontWeight: 600,
              letterSpacing: 2, color: 'var(--text3)',
              textTransform: 'uppercase', marginBottom: 8,
            }}>Authorizer Name</div>

            <input
              type="text"
              autoFocus
              value={authName}
              onChange={e => { setAuthName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmitAuth()}
              placeholder="Enter authorizer name..."
              style={{
                width: '100%', background: 'var(--bg)',
                border: '2px solid ' + (error ? 'var(--red)' : 'var(--border2)'),
                borderRadius: 8, padding: '12px 16px',
                fontFamily: 'Outfit, sans-serif', fontSize: 14,
                color: 'var(--text)', outline: 'none',
                transition: 'border-color 0.2s', marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{
                fontSize: 12, fontWeight: 600,
                color: '#fca5a5', marginBottom: 10,
                animation: 'fadeUp 0.2s ease both',
              }}>✕ {error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={onDeny}
                style={{
                  padding: '12px', borderRadius: 8,
                  border: '1px solid var(--border2)',
                  background: 'var(--bg3)',
                  color: 'var(--text2)',
                  fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700,
                  letterSpacing: 1, cursor: 'pointer',
                  transition: 'all 0.15s', textTransform: 'uppercase',
                }}
              >Cancel</button>
              <button
                onClick={handleSubmitAuth}
                disabled={validating || !authName.trim()}
                style={{
                  padding: '12px', borderRadius: 8,
                  border: '1px solid var(--green)',
                  background: (!authName.trim() || validating) ? 'var(--bg3)' : 'var(--green)',
                  color: (!authName.trim() || validating) ? 'var(--text3)' : '#fff',
                  fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 700,
                  letterSpacing: 1,
                  cursor: (!authName.trim() || validating) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', textTransform: 'uppercase',
                }}
              >Authorize</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
