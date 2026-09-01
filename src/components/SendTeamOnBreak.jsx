import React, { useState } from 'react';
import { bulkUpdateTeam } from '../utils/api';

export default function SendTeamOnBreak({ students, onBreakStart, onRefresh }) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState(null);

  const teams = [...new Set(students.map(s => s.team))].sort();

  function showMsg(text, type) {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  }

  async function handleSend() {
    if (!selectedTeam) return;

    if (!confirm) {
      setConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await bulkUpdateTeam({ team: selectedTeam, status: 'outside' });
      
      if (selectedTeam === 'ALL') {
        teams.forEach(t => onBreakStart(t));
        showMsg('✓ ALL TEAMS sent on break', 'success');
      } else {
        onBreakStart(selectedTeam);
        showMsg('✓ Team ' + selectedTeam + ' sent on break', 'success');
      }
      
      setSelectedTeam('');
      setConfirm(false);
      setTimeout(() => onRefresh(), 2000);
    } catch (err) {
      showMsg('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setConfirm(false);
  }

  const colors = {
    success: { bg: 'var(--green-dim)', border: 'var(--green)', color: '#6ee7b7' },
    error: { bg: 'var(--red-dim)', border: 'var(--red)', color: '#fca5a5' },
  };

  return (
    <div style={{
      padding: '20px 24px',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, fontWeight: 600,
        letterSpacing: 3, color: 'var(--text3)',
        textTransform: 'uppercase', marginBottom: 12,
      }}>Send Team on Break</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <select
          value={selectedTeam}
          onChange={e => { setSelectedTeam(e.target.value); setConfirm(false); }}
          style={{
            flex: 1, background: 'var(--bg)',
            border: '1px solid var(--border2)',
            borderRadius: 7, padding: '10px 14px',
            fontFamily: 'Outfit, sans-serif', fontSize: 13,
            fontWeight: selectedTeam === 'ALL' ? 700 : 400,
            color: selectedTeam ? (selectedTeam === 'ALL' ? 'var(--amber)' : 'var(--text)') : 'var(--text3)',
            outline: 'none', cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23545e6e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="">Select team…</option>
          <option value="ALL" style={{ fontWeight: 700, color: '#f59e0b' }}>🌟 ALL TEAMS (Entire Lobby)</option>
          {teams.map(t => (
            <option key={t} value={t}>Team {t}</option>
          ))}
        </select>

        {!confirm ? (
          <button
            onClick={handleSend}
            disabled={!selectedTeam || loading}
            style={{
              padding: '10px 18px', borderRadius: 7,
              border: '1px solid ' + (!selectedTeam ? 'var(--border)' : 'var(--amber)'),
              background: !selectedTeam ? 'var(--bg3)' : 'var(--amber)',
              color: !selectedTeam ? 'var(--text3)' : 'var(--bg)',
              fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 800,
              letterSpacing: 1, cursor: !selectedTeam ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : '☕ BREAK'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '10px 14px', borderRadius: 7,
                border: '1px solid var(--border2)',
                background: 'var(--bg3)', color: 'var(--text2)',
                fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >✕</button>
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                padding: '10px 16px', borderRadius: 7,
                border: '1px solid var(--green)',
                background: 'var(--green)', color: '#fff',
                fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 800,
                letterSpacing: 1, cursor: 'pointer',
                transition: 'all 0.15s', textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'CONFIRM'}
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div style={{
          marginTop: 10, padding: '9px 12px', borderRadius: 7,
          fontSize: 12, fontWeight: 600, animation: 'fadeUp 0.2s ease',
          background: colors[msg.type]?.bg,
          border: '1px solid ' + colors[msg.type]?.border,
          color: colors[msg.type]?.color,
        }}>{msg.text}</div>
      )}
    </div>
  );
}
