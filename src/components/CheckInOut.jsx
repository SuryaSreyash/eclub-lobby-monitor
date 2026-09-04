import React, { useState } from 'react';
import { updateStudent, addLog, addSpecialPermission } from '../utils/api';
import MajorityWarningModal from './MajorityWarningModal';

export default function CheckInOut({ students, onRefresh, onOptimistic, authorizers = [], teamsOnBreak = new Set(), onSpecialPermission }) {
  const [inputId, setInputId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  // Majority-out modal state
  const [majorityWarning, setMajorityWarning] = useState(null);
  // { student, teamName, insideCount, totalCount, halfRequired }

  const found = inputId.length === 10
    ? students.find(s => s.id === inputId)
    : null;

  function showMsg(text, type) {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4500);
  }

  async function doAction(action, overrideStudent = null) {
    const s = overrideStudent || found;
    if (!s) return;

    if (action === 'out' && s.status === 'outside') {
      showMsg(s.name + ' is already outside.', 'warn'); return;
    }
    if (action === 'in' && s.status === 'inside') {
      showMsg(s.name + ' is already inside.', 'warn'); return;
    }

    if (action === 'out' && !teamsOnBreak.has(s.team)) {
      const teamMembers = students.filter(x => x.team === s.team);
      const insideCount = teamMembers.filter(x => x.status === 'inside').length;
      const half = Math.ceil(teamMembers.length / 2);
      if (insideCount - 1 < half) {
        // Show warning modal instead of hard deny
        setMajorityWarning({
          student: s,
          teamName: s.team,
          insideCount,
          totalCount: teamMembers.length,
          halfRequired: half,
        });
        return;
      }
    }

    executeCheckout(s, action);
  }

  async function executeCheckout(s, action) {
    if (onOptimistic) onOptimistic(s.id, action, s);
    setInputId('');
    showMsg(action === 'out' ? '✓ ' + s.name + ' checked OUT' : '✓ ' + s.name + ' checked IN', 'success');

    setLoading(true);
    try {
      const exitTime  = action === 'out' ? Date.now().toString() : '';
      const entryTime = action === 'in'  ? Date.now().toString() : (s.entryTime || '');
      const status    = action === 'out' ? 'outside' : 'inside';

      await updateStudent({ id: s.id, status, exitTime, entryTime });
      await addLog({ studentId: s.id, studentName: s.name, team: s.team, actionType: action });

      if (onRefresh) onRefresh();
    } catch (err) {
      showMsg('Error saving. Check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleMajorityPermit(authorizerName) {
    if (!majorityWarning) return;
    const s = majorityWarning.student;

    // Record the special permission
    addSpecialPermission({ team: s.team, authorizer: authorizerName });
    if (onSpecialPermission) onSpecialPermission({ team: s.team, authorizer: authorizerName });

    setMajorityWarning(null);
    executeCheckout(s, 'out');
  }

  function handleMajorityDeny() {
    setMajorityWarning(null);
  }

  const colors = {
    success: { bg: 'var(--green-dim)', border: 'var(--green)',  color: '#6ee7b7' },
    error:   { bg: 'var(--red-dim)',   border: 'var(--red)',    color: '#fca5a5' },
    warn:    { bg: 'var(--amber-dim)', border: 'var(--amber)',  color: '#fde68a' },
  };

  const outDisabled = !found || loading || found?.status === 'outside';
  const inDisabled  = !found || loading || found?.status === 'inside';

  return (
    <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--border)' }}>

      <div style={{
        fontFamily: 'JetBrains Mono,monospace', fontSize: 10, fontWeight: 600,
        letterSpacing: 3, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16,
      }}>
        Student Check-In / Check-Out
      </div>

      <input
        type="text" maxLength={10} value={inputId}
        onChange={e => setInputId(e.target.value.replace(/\D/g, ''))}
        onKeyDown={e => {
          if (e.key === 'Enter' && found) {
            found.status === 'inside' ? doAction('out') : doAction('in');
          }
        }}
        placeholder="Enter 10-digit student ID"
        style={{
          width: '100%', background: 'var(--bg)',
          border: '2px solid ' + (found ? 'var(--amber)' : 'var(--border2)'),
          borderRadius: 8, padding: '14px 18px',
          fontFamily: 'JetBrains Mono,monospace', fontSize: 20,
          fontWeight: 500, color: 'var(--text)', letterSpacing: 4,
          outline: 'none', marginBottom: 12, transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
      />

      {inputId.length === 10 && (
        <div style={{
          background: found ? 'var(--bg3)' : 'var(--red-dim)',
          border: '1px solid ' + (found ? 'var(--border2)' : 'var(--red)'),
          borderLeft: '3px solid ' + (found ? 'var(--amber)' : 'var(--red)'),
          borderRadius: 8, padding: '12px 16px', marginBottom: 12,
          animation: 'fadeUp 0.2s ease',
        }}>
          {found ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 5 }}>{found.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, color: 'var(--text2)', letterSpacing: 1, marginBottom: 8 }}>{found.id} · Team {found.team} {found.type ? `(${found.type.trim().toUpperCase()[0]})` : ''}</div>
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 2,
                padding: '3px 10px', borderRadius: 20,
                background: found.status === 'inside' ? 'var(--green-dim)' : 'var(--red-dim)',
                color:      found.status === 'inside' ? '#6ee7b7' : '#fca5a5',
                border: '1px solid ' + (found.status === 'inside' ? 'var(--green)' : 'var(--red)'),
              }}>
                {found.status === 'inside' ? '● INSIDE' : '● OUTSIDE'}
              </span>
            </>
          ) : (
            <div style={{ color: '#fca5a5', fontSize: 13, fontWeight: 600 }}>✕ No student found with ID {inputId}</div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => doAction('out')} disabled={outDisabled} style={{
          padding: '14px', borderRadius: 8,
          border: '1px solid ' + (outDisabled ? 'var(--border)' : 'var(--red)'),
          background: outDisabled ? 'var(--bg3)' : 'var(--red)',
          color: outDisabled ? 'var(--text3)' : '#fff',
          fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800,
          letterSpacing: 2, cursor: outDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s', textTransform: 'uppercase',
        }}>
          {loading ? <span className="spinner" /> : '↑ OUT'}
        </button>
        <button onClick={() => doAction('in')} disabled={inDisabled} style={{
          padding: '14px', borderRadius: 8,
          border: '1px solid ' + (inDisabled ? 'var(--border)' : 'var(--green)'),
          background: inDisabled ? 'var(--bg3)' : 'var(--green)',
          color: inDisabled ? 'var(--text3)' : '#fff',
          fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800,
          letterSpacing: 2, cursor: inDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s', textTransform: 'uppercase',
        }}>
          {loading ? <span className="spinner" /> : '↓ IN'}
        </button>
      </div>

      {msg && (
        <div style={{
          marginTop: 12, padding: '11px 14px', borderRadius: 7,
          fontSize: 13, fontWeight: 600, animation: 'fadeUp 0.2s ease',
          background: colors[msg.type]?.bg,
          border: '1px solid ' + colors[msg.type]?.border,
          color: colors[msg.type]?.color,
        }}>{msg.text}</div>
      )}

      {/* Majority-Out Warning Modal */}
      {majorityWarning && (
        <MajorityWarningModal
          student={majorityWarning.student}
          teamName={majorityWarning.teamName}
          insideCount={majorityWarning.insideCount}
          totalCount={majorityWarning.totalCount}
          halfRequired={majorityWarning.halfRequired}
          authorizers={authorizers}
          onPermit={handleMajorityPermit}
          onDeny={handleMajorityDeny}
        />
      )}

    </div>
  );
}