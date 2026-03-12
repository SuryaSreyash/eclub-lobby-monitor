import React from 'react';

function parseTime(ts) {
  if (!ts) return null;
  if (/^\d+$/.test(ts)) return new Date(parseInt(ts));
  return new Date(ts);
}

function fmtTime(ts) {
  if (!ts) return '-';
  const d = parseTime(ts);
  if (!d || isNaN(d.getTime())) return ts;
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
}

function calcTripTime(entry, allLogs) {
  // Only calculate trip time for IN entries
  if (entry.action !== 'in') return null;

  // Find the matching OUT entry for this student
  // It should be the most recent OUT before this IN
  const entryTime = parseTime(entry.timestamp);
  if (!entryTime) return null;

  // Look through logs for the matching OUT
  const matchingOut = allLogs.find(log => {
    if (log.action !== 'out') return false;
    if (log.studentId !== entry.studentId) return false;
    const outTime = parseTime(log.timestamp);
    if (!outTime) return false;
    return outTime < entryTime;
  });

  if (!matchingOut) return null;

  const outTime = parseTime(matchingOut.timestamp);
  if (!outTime) return null;

  const diffMs   = entryTime - outTime;
  const diffMins = diffMs / 60000;
  const m        = Math.floor(diffMins);
  const s        = Math.floor((diffMs % 60000) / 1000);

  return {
    display:  m + 'm ' + s + 's',
    overdue:  diffMins >= 15,
  };
}

export default function ActivityLog({ logs }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '16px 24px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 10, fontWeight: 600,
          letterSpacing: 3, color: 'var(--text3)',
          textTransform: 'uppercase',
        }}>Activity Log</div>
        <div style={{
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
        }}>LAST 100 ENTRIES</div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 24px' }}>
        {!logs.length ? (
          <div style={{
            textAlign: 'center', padding: 32,
            color: 'var(--text3)',
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 11, letterSpacing: 2,
          }}>NO ACTIVITY YET</div>
        ) : (
          logs.map((entry, i) => {
            const trip = calcTripTime(entry, logs);

            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '140px 28px 1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                marginBottom: 7,
                animation: 'fadeUp 0.3s ease ' + Math.min(i, 8) * 0.04 + 's both',
              }}>

                {/* Time */}
                <div style={{
                  fontFamily: 'JetBrains Mono,monospace',
                  fontSize: 12, color: 'var(--text3)',
                  letterSpacing: 1, lineHeight: 1.5,
                }}>{fmtTime(entry.timestamp)}</div>

                {/* Arrow */}
                <div style={{
                  fontSize: 18, fontWeight: 800, textAlign: 'center',
                  color: entry.action === 'out' ? 'var(--red)' : 'var(--green)',
                }}>
                  {entry.action === 'out' ? '↑' : '↓'}
                </div>

                {/* Info */}
                <div>
                  {/* Student name — big and clear */}
                  <div style={{
                    fontSize: 16, fontWeight: 700,
                    color: 'var(--text)', marginBottom: 3,
                  }}>
                    {entry.studentName}
                  </div>

                  {/* ID · Team */}
                  <div style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 12, color: 'var(--text3)', letterSpacing: 1,
                    marginBottom: trip ? 5 : 0,
                  }}>
                    {entry.studentId} · {entry.team}
                  </div>

                  {/* Trip time — only shows on IN entries */}
                  {trip && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: trip.overdue
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(16,185,129,0.12)',
                      border: '1px solid ' + (trip.overdue
                        ? 'rgba(239,68,68,0.3)'
                        : 'rgba(16,185,129,0.3)'),
                      borderRadius: 6,
                      padding: '3px 10px',
                    }}>
                      <span style={{ fontSize: 12 }}>⏱</span>
                      <span style={{
                        fontFamily: 'JetBrains Mono,monospace',
                        fontSize: 12, fontWeight: 700,
                        color: trip.overdue ? 'var(--red)' : 'var(--green)',
                      }}>
                        Trip: {trip.display}
                      </span>
                      {trip.overdue && (
                        <span style={{
                          fontFamily: 'JetBrains Mono,monospace',
                          fontSize: 10,
                          color: 'var(--red)',
                          marginLeft: 2,
                        }}>— EXCEEDED 15 MIN</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Badge */}
                <div style={{
                  fontFamily: 'JetBrains Mono,monospace',
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: 1, padding: '4px 10px',
                  borderRadius: 20, textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  background: entry.action === 'out'
                    ? 'var(--red-dim)'
                    : 'var(--green-dim)',
                  color: entry.action === 'out'
                    ? '#fca5a5'
                    : '#6ee7b7',
                  border: '1px solid ' + (entry.action === 'out'
                    ? 'rgba(239,68,68,0.3)'
                    : 'rgba(16,185,129,0.3)'),
                }}>
                  {entry.action === 'out' ? 'Exited' : 'Returned'}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}