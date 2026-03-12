import React, { useState, useEffect } from 'react';

function parseTime(exitTime) {
  if (!exitTime) return null;
  if (/^\d+$/.test(exitTime)) {
    return new Date(parseInt(exitTime));
  }
  return new Date(exitTime);
}

function elapsedStr(exitTime) {
  if (!exitTime) return '';
  var exit = parseTime(exitTime);
  if (!exit || isNaN(exit.getTime())) return '';
  var secs = Math.floor((Date.now() - exit.getTime()) / 1000);
  if (secs < 0) return '';
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  if (m < 60) return m + 'm ' + s + 's';
  return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
}

function isOverdue(exitTime) {
  if (!exitTime) return false;
  var exit = parseTime(exitTime);
  if (!exit || isNaN(exit.getTime())) return false;
  return (Date.now() - exit.getTime()) / 60000 >= 15;
}

export default function Dashboard({ students }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const outside = students.filter(s => s.status === 'outside');
  const inside = students.length - outside.length;

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 1, background: 'var(--border)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        {[
          { label: 'TOTAL', val: students.length, color: 'var(--amber)' },
          { label: 'INSIDE', val: inside, color: 'var(--green)' },
          { label: 'OUTSIDE', val: outside.length, color: 'var(--red)' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{
            background: 'var(--bg2)',
            padding: '18px 12px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'Outfit,sans-serif',
              fontSize: 52, fontWeight: 800,
              color, lineHeight: 1,
              textShadow: '0 0 20px ' + color + '55',
              marginBottom: 6,
            }}>{val}</div>
            <div style={{
              fontFamily: 'JetBrains Mono,monospace',
              fontSize: 11, fontWeight: 600,
              letterSpacing: 2, color: 'var(--text3)',
              textTransform: 'uppercase',
            }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 12,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 10, fontWeight: 600,
            letterSpacing: 3, color: 'var(--text3)',
            textTransform: 'uppercase',
          }}>Currently Outside</div>
          <div style={{
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 11, color: 'var(--text3)',
          }}>{outside.length} student{outside.length !== 1 ? 's' : ''}</div>
        </div>

        {!outside.length ? (
          <div style={{
            textAlign: 'center', padding: '24px',
            color: 'var(--text3)',
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 11, letterSpacing: 2,
          }}>ALL STUDENTS INSIDE</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))',
            gap: 8,
          }}>
            {outside.map(s => {
              const overdue = isOverdue(s.exitTime);
              return (
                <div key={s.id} style={{
                  background: overdue ? 'rgba(245,158,11,0.07)' : 'var(--bg3)',
                  border: '1px solid ' + (overdue ? 'rgba(245,158,11,0.35)' : 'var(--border)'),
                  borderRadius: 8, padding: '12px 14px',
                  position: 'relative',
                  animation: 'fadeUp 0.3s ease',
                }}>
                  {overdue && (
                    <span style={{
                      position: 'absolute', top: 8, right: 10,
                      fontSize: 13, color: 'var(--amber)',
                    }}>⚠</span>
                  )}
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: 'var(--text)', marginBottom: 3, paddingRight: 20,
                  }}>{s.name}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 10, color: 'var(--text3)',
                    letterSpacing: 1, marginBottom: 6,
                  }}>{s.id}</div>
                  <div style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 600,
                    color: 'var(--amber2)', background: 'var(--amber-dim)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    padding: '2px 8px', borderRadius: 10, marginBottom: 7,
                  }}>{s.team}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 12, fontWeight: 600,
                    color: overdue ? 'var(--amber)' : 'var(--red)',
                  }}>⏱ {elapsedStr(s.exitTime)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}