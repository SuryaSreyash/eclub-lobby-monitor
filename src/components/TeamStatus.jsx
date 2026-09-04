import React, { useState, useEffect } from 'react';

function parseTime(exitTime) {
  if (!exitTime) return null;
  if (/^\d+$/.test(exitTime)) return new Date(parseInt(exitTime));
  return new Date(exitTime);
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

export default function TeamStatus({ students, specialPermissions = [] }) {
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [, setTick] = useState(0);

  // Re-render every 1s for live timers in the dropdown
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const teams = [...new Set(students.map(s => s.team))].sort();
  if (!teams.length) return null;

  // Build a map of team → permission info
  const permByTeam = {};
  specialPermissions.forEach(p => {
    permByTeam[p.team] = p;
  });

  return (
    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, fontWeight: 600, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14 }}>Team Status</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {teams.map(team => {
          const members = students.filter(s => s.team === team);
          const inside = members.filter(s => s.status === 'inside').length;
          const total = members.length;
          const warn = inside < Math.ceil(total / 2);
          const activeColor = warn ? 'var(--amber)' : 'var(--green)';
          const isExpanded = expandedTeam === team;
          const hasPerm = !!permByTeam[team];

          // Determine display blocks count (cap visually at 6 blocks max)
          const displayTotal = Math.min(total, 6);
          const filledCount = total <= 6 
            ? inside 
            : Math.round((inside / total) * displayTotal);

          return (
            <div key={team}>
              {/* Team row — clickable */}
              <div
                onClick={() => setExpandedTeam(isExpanded ? null : team)}
                style={{
                  background: warn ? 'rgba(245,158,11,0.06)' : 'var(--bg3)',
                  border: '1px solid ' + (warn ? 'rgba(245,158,11,0.3)' : 'var(--border)'),
                  borderRadius: isExpanded ? '8px 8px 0 0' : 8,
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  userSelect: 'none',
                }}
              >
                {/* Left group: Expand Arrow + Team Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, color: 'var(--text3)',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    width: 10, textAlign: 'center',
                  }}>▶</span>

                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {team}{warn && <span style={{ marginLeft: 6 }}>⚠</span>}
                  </div>
                </div>

                {/* Center group: Nokia Battery Indicator with extra margin spacing */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 20px',
                  flex: 1,
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 7px',
                    background: 'var(--bg)',
                    border: '1.5px solid ' + (warn ? 'rgba(245,158,11,0.4)' : 'var(--border2)'),
                    borderRadius: 5,
                    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6)',
                  }}>
                    {Array.from({ length: displayTotal }).map((_, idx) => {
                      const isFilled = idx < filledCount;
                      return (
                        <div
                          key={idx}
                          style={{
                            width: 6,
                            height: 13,
                            borderRadius: 1.5,
                            background: isFilled ? activeColor : 'rgba(255, 255, 255, 0.04)',
                            border: isFilled 
                              ? 'none' 
                              : '1px solid var(--border)',
                            boxShadow: isFilled 
                              ? '0 0 6px ' + activeColor + '99' 
                              : 'none',
                            transition: 'all 0.25s ease',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Right group: Member count + star */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono,monospace', fontSize: 11,
                    color: warn ? 'var(--amber)' : 'var(--text2)',
                    fontWeight: warn ? 600 : 400,
                  }}>{inside}/{total}</span>

                  {hasPerm && (
                    <span title={'Authorized by ' + permByTeam[team].authorizer} style={{
                      fontSize: 13, color: 'var(--star)',
                      animation: 'starPulse 2s ease-in-out infinite',
                      cursor: 'help',
                    }}>★</span>
                  )}
                </div>
              </div>

              {/* Dropdown — member list */}
              {isExpanded && (
                <div style={{
                  background: 'var(--bg)',
                  border: '1px solid ' + (warn ? 'rgba(245,158,11,0.3)' : 'var(--border)'),
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  overflow: 'hidden',
                  animation: 'dropdownOpen 0.3s ease both',
                }}>
                  {/* Authorizer badge if special permission */}
                  {hasPerm && (
                    <div style={{
                      padding: '8px 14px',
                      background: 'var(--purple-dim)',
                      borderBottom: '1px solid var(--purple-border)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--star)' }}>★</span>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10, color: 'var(--purple)', letterSpacing: 1,
                      }}>
                        Authorized by <strong>{permByTeam[team].authorizer}</strong>
                      </span>
                    </div>
                  )}

                  {members.map(s => {
                    const isOutside = s.status === 'outside';
                    return (
                      <div key={s.id} style={{
                        padding: '9px 14px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        borderBottom: '1px solid var(--border)',
                        animation: 'fadeUp 0.2s ease both',
                      }}>
                        {/* Status dot */}
                        <div style={{
                          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                          background: isOutside ? 'var(--red)' : 'var(--green)',
                          boxShadow: '0 0 6px ' + (isOutside ? 'var(--red)' : 'var(--green)'),
                        }} />

                        {/* Name + ID */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12, fontWeight: 600, color: 'var(--text)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{s.name} {s.type ? `(${s.type.trim().toUpperCase()[0]})` : ''}</div>
                          <div style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 9, color: 'var(--text3)', letterSpacing: 1,
                          }}>{s.id}</div>
                        </div>

                        {/* Status badge */}
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: 1,
                          padding: '2px 8px', borderRadius: 12,
                          background: isOutside ? 'var(--red-dim)' : 'var(--green-dim)',
                          color: isOutside ? '#fca5a5' : '#6ee7b7',
                          border: '1px solid ' + (isOutside ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'),
                          fontFamily: 'JetBrains Mono, monospace',
                          textTransform: 'uppercase', flexShrink: 0,
                        }}>{isOutside ? 'OUT' : 'IN'}</span>

                        {/* Elapsed timer for outside students */}
                        {isOutside && s.exitTime && (
                          <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 10, color: 'var(--amber)',
                            fontWeight: 600, flexShrink: 0,
                          }}>⏱ {elapsedStr(s.exitTime)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
