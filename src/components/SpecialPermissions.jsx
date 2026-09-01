import React from 'react';

export default function SpecialPermissions({ specialPermissions = [] }) {
  if (!specialPermissions.length) {
    return (
      <div style={{
        padding: '16px 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, fontWeight: 600,
          letterSpacing: 3, color: 'var(--text3)',
          textTransform: 'uppercase', marginBottom: 12,
        }}>Special Permissions</div>
        <div style={{
          textAlign: 'center', padding: '20px 8px',
          color: 'var(--text3)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: 2,
        }}>NO ACTIVE OVERRIDES</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px 18px',
      borderBottom: '1px solid var(--border)',
      flex: 1,
      overflowY: 'auto',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, fontWeight: 600,
        letterSpacing: 3, color: 'var(--text3)',
        textTransform: 'uppercase', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>Special Permissions</span>
        <span style={{
          background: 'var(--purple-dim)',
          border: '1px solid var(--purple-border)',
          color: 'var(--purple)',
          padding: '2px 8px', borderRadius: 10,
          fontSize: 10, fontWeight: 700,
        }}>{specialPermissions.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {specialPermissions.map((perm, i) => (
          <div key={i} style={{
            background: 'var(--purple-dim)',
            border: '1px solid var(--purple-border)',
            borderRadius: 8, padding: '10px 14px',
            animation: 'fadeUp 0.3s ease ' + i * 0.06 + 's both',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
            }}>
              <span style={{
                fontSize: 14, color: 'var(--star)',
                animation: 'starPulse 2s ease-in-out infinite',
              }}>★</span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: 'var(--text)',
              }}>Team {perm.team}</span>
            </div>

            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
            }}>
              Authorized by <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{perm.authorizer}</span>
            </div>

            {perm.timestamp && (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, color: 'var(--text3)',
                letterSpacing: 1, marginTop: 4, opacity: 0.7,
              }}>{perm.timestamp}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
