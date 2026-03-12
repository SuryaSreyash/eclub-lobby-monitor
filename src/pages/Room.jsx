import React, { useState, useEffect, useCallback } from 'react';
import { fetchStudents, fetchLogs } from '../utils/api';
import CheckInOut  from '../components/CheckInOut';
import Dashboard   from '../components/Dashboard';
import TeamStatus  from '../components/TeamStatus';
import ActivityLog from '../components/ActivityLog';
import AlertBanner from '../components/AlertBanner';

const REFRESH_MS = 15000;

export default function Room() {
  const [students, setStudents] = useState([]);
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncing,  setSyncing]  = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setSyncing(true);
    setError(null);
    try {
      // Fetch students and logs at same time
      const [s, l] = await Promise.all([fetchStudents(), fetchLogs()]);
      setStudents(s);
      setLogs(l);
      setLastSync(new Date());
    } catch (e) {
      setError('Could not connect to Google Sheets. Check your Apps Script URL in the .env file.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Optimistic update — update local state instantly without waiting for Sheets
  const optimisticUpdate = useCallback((studentId, action) => {
    const exitTime  = action === 'out' ? Date.now().toString() : '';
    const entryTime = action === 'in'  ? Date.now().toString() : '';
    const status    = action === 'out' ? 'outside' : 'inside';

    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, status, exitTime, entryTime }
        : s
    ));

    const student = students.find(s => s.id === studentId);
    if (student) {
      setLogs(prev => [{
        studentId,
        studentName: student.name,
        team: student.team,
        action,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    }
  }, [students]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'var(--bg)' }}>
      <div className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'var(--text3)', letterSpacing:2 }}>LOADING STUDENT DATA...</div>
    </div>
  );

  if (error) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:32, background:'var(--bg)' }}>
      <div style={{ fontSize:32 }}>⚠️</div>
      <div style={{ fontSize:14, fontWeight:600, color:'var(--red)', textAlign:'center', maxWidth:480 }}>{error}</div>
      <button onClick={() => load()} style={{ marginTop:8, padding:'10px 24px', background:'var(--amber)', color:'var(--bg)', border:'none', borderRadius:7, fontFamily:'Outfit,sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', letterSpacing:1 }}>RETRY</button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

      {/* Header */}
      <header style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, zIndex:100 }}>
        <div style={{ fontFamily:'Outfit,sans-serif', fontSize:18, fontWeight:800, color:'var(--text)', letterSpacing:1 }}>
          E-Club <span style={{ color:'var(--amber)' }}>Lobby Monitor</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:7, height:7, background:'var(--green)', borderRadius:'50%', boxShadow:'0 0 8px var(--green)', animation:'pulse 1.5s infinite' }} />
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'var(--green)', letterSpacing:2 }}>LIVE</span>
          </div>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'var(--text3)', letterSpacing:1, display:'flex', alignItems:'center', gap:8 }}>
            {syncing && <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} />}
            {lastSync && !syncing && <span>synced {lastSync.toLocaleTimeString('en-IN', { hour12:false })}</span>}
          </div>
          <button onClick={() => load(true)} disabled={syncing} style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text2)', padding:'6px 14px', borderRadius:6, fontFamily:'JetBrains Mono,monospace', fontSize:10, letterSpacing:2, cursor: syncing ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
            ↻ REFRESH
          </button>
        </div>
      </header>

      {/* Alert Banner */}
      <AlertBanner students={students} />

      {/* Body */}
      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', flex:1, overflow:'hidden' }}>
        <div style={{ background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <CheckInOut students={students} onRefresh={() => load(true)} />
          <Dashboard  students={students} />
          <TeamStatus students={students} />
        </div>
        <div style={{ background:'var(--bg)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
