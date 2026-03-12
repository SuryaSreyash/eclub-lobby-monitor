import React from 'react';

export default function TeamStatus({ students }) {
  const teams = [...new Set(students.map(s => s.team))].sort();
  if (!teams.length) return null;

  return (
    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, fontWeight: 600, letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 14 }}>Team Status</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {teams.map(team => {
          const members = students.filter(s => s.team === team);
          const inside = members.filter(s => s.status === 'inside').length;
          const total = members.length;
          const pct = total > 0 ? Math.round((inside / total) * 100) : 0;
          const warn = inside < Math.ceil(total / 2);
          const color = warn ? 'var(--amber)' : 'var(--green)';
          return (
            <div key={team} style={{
              background: warn ? 'rgba(245,158,11,0.06)' : 'var(--bg3)',
              border: '1px solid ' + (warn ? 'rgba(245,158,11,0.3)' : 'var(--border)'),
              borderRadius: 7, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 64, fontSize: 12, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>
                {team}{warn && <span style={{ marginLeft: 6 }}>⚠</span>}
              </div>
              <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: 3, transition: 'width 0.5s ease', boxShadow: '0 0 8px ' + color }} />
              </div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: warn ? 'var(--amber)' : 'var(--text2)', flexShrink: 0, fontWeight: warn ? 600 : 400 }}>{inside}/{total}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
