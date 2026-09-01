import React, { useState, useEffect, useRef } from 'react';

function parseTime(exitTime) {
  if (!exitTime) return null;
  if (/^\d+$/.test(exitTime)) return new Date(parseInt(exitTime));
  return new Date(exitTime);
}

function getMinutesOut(exitTime) {
  if (!exitTime) return 0;
  var exit = parseTime(exitTime);
  if (!exit || isNaN(exit.getTime())) return 0;
  return (Date.now() - exit.getTime()) / 60000;
}

function elapsed(exitTime) {
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

export default function AlertBanner({ students, teamsOnBreak = new Set() }) {
  const [, setTick] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const [visible, setVisible] = useState(true);
  const prevOverdueIds = useRef([]);

  // Re-check every 30 seconds
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const overdue = students.filter(s => {
    if (s.status !== 'outside') return false;
    if (teamsOnBreak.has(s.team)) return false;
    return getMinutesOut(s.exitTime) >= 15;
  });

  // When a new student becomes overdue, show popup again
  useEffect(() => {
    const currentIds = overdue.map(s => s.id).join(',');
    const prevIds = prevOverdueIds.current.join(',');
    if (currentIds !== prevIds && overdue.length > 0) {
      setVisible(true);
      setDismissed([]);
    }
    prevOverdueIds.current = overdue.map(s => s.id);
  }, [overdue.length]);

  const activeAlerts = overdue.filter(s => !dismissed.includes(s.id));

  if (!activeAlerts.length || !visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxWidth: 340,
    }}>
      {activeAlerts.map((s, i) => (
        <div
          key={s.id}
          style={{
            background: '#1c1008',
            border: '1px solid #d97706',
            borderLeft: '4px solid #f59e0b',
            borderRadius: 10,
            padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.15)',
            animation: 'slideInRight 0.35s ease both',
            animationDelay: i * 0.08 + 's',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setDismissed(prev => [...prev, s.id])}
            style={{
              position: 'absolute',
              top: 10, right: 10,
              background: 'transparent',
              border: 'none',
              color: '#92400e',
              fontSize: 16,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >✕</button>

          {/* Icon + Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              color: '#fbbf24',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>Student Overdue</span>
          </div>

          {/* Student info */}
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#fde68a',
            marginBottom: 3,
            paddingRight: 20,
          }}>{s.name}</div>

          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#92400e',
            letterSpacing: 1,
            marginBottom: 8,
          }}>{s.id} · {s.team}</div>

          {/* Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 6,
            padding: '5px 10px',
            width: 'fit-content',
          }}>
            <span style={{ fontSize: 13 }}>⏱</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              fontWeight: 700,
              color: '#f59e0b',
            }}>Outside for {elapsed(s.exitTime)}</span>
          </div>
        </div>
      ))}

      {/* Dismiss all button if more than 1 */}
      {activeAlerts.length > 1 && (
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid var(--border2)',
            color: 'var(--text3)',
            borderRadius: 8,
            padding: '8px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: 2,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >Dismiss All</button>
      )}
    </div>
  );
}