import React, { useState, useEffect } from 'react';

function parseTime(exitTime) {
  if (!exitTime) return null;
  if (/^\d+$/.test(exitTime)) return new Date(parseInt(exitTime));
  return new Date(exitTime);
}

function getMinutesOut(exitTime) {
  if (!exitTime) return 0;
  const exit = parseTime(exitTime);
  if (!exit || isNaN(exit.getTime())) return 0;
  return (Date.now() - exit.getTime()) / 60000;
}

function elapsedStr(exitTime) {
  if (!exitTime) return '';
  const exit = parseTime(exitTime);
  if (!exit || isNaN(exit.getTime())) return '';
  const secs = Math.floor((Date.now() - exit.getTime()) / 1000);
  if (secs < 0) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m < 60) return m + 'm ' + s + 's';
  return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
}

export default function TimerAlerts({ students, teamsOnBreak = new Set() }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const overdue = students.filter(s => {
    if (s.status !== 'outside') return false;
    if (teamsOnBreak.has(s.team)) return false;
    return getMinutesOut(s.exitTime) >= 15;
  });

  return (
    <div style={{
      padding: '16px 18px',
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
        <span>Timer Alerts</span>
        {overdue.length > 0 && (
          <span style={{
            background: 'var(--red-dim)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--red)',
            padding: '2px 8px', borderRadius: 10,
            fontSize: 10, fontWeight: 700,
            animation: 'pulse 1.5s infinite',
          }}>{overdue.length}</span>
        )}
      </div>

      {!overdue.length ? (
        <div style={{
          textAlign: 'center', padding: '20px 8px',
          color: 'var(--text3)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: 2,
        }}>NO OVERDUE STUDENTS</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {overdue.map((s, i) => (
            <div key={s.id} style={{
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderLeft: '3px solid var(--amber)',
              borderRadius: 8, padding: '10px 12px',
              animation: 'fadeUp 0.3s ease ' + i * 0.06 + 's both',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
              }}>
                <span style={{
                  fontSize: 13, color: 'var(--amber)',
                  animation: 'pulse 1.5s infinite',
                }}>⚠</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--text)',
                }}>{s.name}</span>
              </div>

              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
                marginBottom: 6,
              }}>{s.id} · {s.team}</div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--amber-dim)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 6, padding: '3px 8px',
              }}>
                <span style={{ fontSize: 11 }}>⏱</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--amber)',
                }}>{elapsedStr(s.exitTime)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
