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
  const [filter, setFilter] = useState('ALL');
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const outside = students.filter(s => s.status === 'outside');
  const inside = students.length - outside.length;

  const filteredOutside = outside.filter(s => {
    if (filter === 'ALL') return true;
    const cat = (s.category || s.type || s.domain || '').toLowerCase();
    if (cat) {
      if (filter === 'SOFTWARE') return cat === 's' || cat.includes('software');
      if (filter === 'HARDWARE') return cat === 'h' || cat.includes('hardware');
      return cat.includes(filter.toLowerCase());
    }
    return (s.team || '').toLowerCase().includes(filter.toLowerCase());
  });

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
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 10, fontWeight: 600,
            letterSpacing: 3, color: 'var(--text3)',
            textTransform: 'uppercase',
          }}>Currently Outside</div>

          {/* Software / Hardware Filter */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--bg3)', padding: 3, borderRadius: 6,
            border: '1px solid var(--border)',
          }}>
            {['ALL', 'SOFTWARE', 'HARDWARE'].map(opt => {
              const active = filter === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  style={{
                    background: active ? 'var(--amber-dim)' : 'transparent',
                    color: active ? 'var(--amber2)' : 'var(--text3)',
                    border: active ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
                    borderRadius: 4,
                    padding: '3px 9px',
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    letterSpacing: 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div style={{
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 11, color: 'var(--text3)',
          }}>
            {filter === 'ALL' ? (
              `${outside.length} student${outside.length !== 1 ? 's' : ''}`
            ) : (
              `${filteredOutside.length} of ${outside.length} (${filter})`
            )}
          </div>
        </div>

        {!filteredOutside.length ? (
          <div style={{
            textAlign: 'center', padding: '24px',
            color: 'var(--text3)',
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 11, letterSpacing: 2,
          }}>
            {!outside.length ? 'ALL STUDENTS INSIDE' : `NO ${filter} STUDENTS OUTSIDE`}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))',
            gap: 8,
          }}>
            {filteredOutside.map(s => {
              const overdue = isOverdue(s.exitTime);
              const cat = s.category || s.type || s.domain;

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 7 }}>
                    <div style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 600,
                      color: 'var(--amber2)', background: 'var(--amber-dim)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      padding: '2px 8px', borderRadius: 10,
                    }}>
                      {s.team} {s.type && !cat ? `(${s.type.trim().toUpperCase()})` : ''}
                    </div>

                    {cat && (
                      <div style={{
                        display: 'inline-block', fontSize: 9, fontWeight: 700,
                        color: cat.toLowerCase().includes('software') || cat.toLowerCase() === 's' ? '#60a5fa' : cat.toLowerCase().includes('hardware') || cat.toLowerCase() === 'h' ? '#a7f3d0' : 'var(--text2)',
                        background: cat.toLowerCase().includes('software') || cat.toLowerCase() === 's' ? 'rgba(59,130,246,0.15)' : cat.toLowerCase().includes('hardware') || cat.toLowerCase() === 'h' ? 'rgba(16,185,129,0.15)' : 'var(--bg2)',
                        border: '1px solid ' + (cat.toLowerCase().includes('software') || cat.toLowerCase() === 's' ? 'rgba(59,130,246,0.3)' : cat.toLowerCase().includes('hardware') || cat.toLowerCase() === 'h' ? 'rgba(16,185,129,0.3)' : 'var(--border)'),
                        padding: '2px 7px', borderRadius: 10,
                        fontFamily: 'JetBrains Mono,monospace', textTransform: 'uppercase',
                      }}>{cat}</div>
                    )}
                  </div>
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