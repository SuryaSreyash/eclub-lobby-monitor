const BASE = 'https://script.google.com/macros/s/AKfycby6hf_4Tg7-gK4TFhe0yimgAiDvbJwze2Pa2vwmnyDKvbG04dfjcSmTcKsTtE2xGgMA/exec';
const USE_MOCK = process.env.REACT_APP_MOCK_API === 'true';

// Local memory store for mock mode
let mockStudents = [
  { id: '2024017306', name: 'Anushka Prajapati', team: 'T4', status: 'inside', exitTime: '', entryTime: '', type: 's' },
  { id: '2024005600', name: 'Laxmi Vajra', team: 'T4', status: 'inside', exitTime: '', entryTime: '', type: 'h' },
  { id: '2024007430', name: 'Usha Rani', team: 'T4', status: 'inside', exitTime: '', entryTime: '', type: 's' },
  { id: '2024142402', name: 'Sreeshanth Talari', team: 'Knowledge tribe', status: 'inside', exitTime: '', entryTime: '', type: 's' },
  { id: '2024013649', name: 'Karthik Garlapally', team: 'Knowledge tribe', status: 'inside', exitTime: '', entryTime: '', type: 'h' }
];
let mockLogs = [];
let mockSpecialPermissions = [];
const mockAuthorizers = ['Alice', 'Bob', 'Charlie'];

function buildUrl(params) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  url.searchParams.append('_t', Date.now());
  return url.toString();
}

export async function fetchStudents() {
  if (USE_MOCK) {
    return [...mockStudents];
  }
  const res = await fetch(buildUrl({ action: 'getStudents' }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function updateStudent({ id, status, exitTime = '', entryTime = '', category = '' }) {
  if (USE_MOCK) {
    mockStudents = mockStudents.map(s => s.id === id ? { ...s, status, exitTime, entryTime, ...(category ? { category } : {}) } : s);
    return { success: true };
  }
  const params = { action: 'updateStudent', id, status, exitTime, entryTime };
  if (category) params.category = category;
  const res = await fetch(buildUrl(params));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function addLog({ studentId, studentName, team, actionType }) {
  if (USE_MOCK) {
    mockLogs.push({ 
      studentId, 
      studentName, 
      team, 
      action: actionType, 
      actionType,
      timestamp: new Date().toLocaleString('en-IN') 
    });
    return { success: true };
  }
  const res = await fetch(buildUrl({ action: 'addLog', studentId, studentName, team, actionType }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchLogs() {
  if (USE_MOCK) {
    return [...mockLogs].reverse();
  }
  const res = await fetch(buildUrl({ action: 'getLogs' }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchAuthorizers() {
  if (USE_MOCK) {
    return [...mockAuthorizers];
  }
  const res = await fetch(buildUrl({ action: 'getAuthorizers' }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function addSpecialPermission({ team, authorizer }) {
  if (USE_MOCK) {
    mockSpecialPermissions.push({ team, authorizer, timestamp: new Date().toLocaleString('en-IN') });
    return { success: true };
  }
  const res = await fetch(buildUrl({ action: 'addSpecialPermission', team, authorizer }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchSpecialPermissions() {
  if (USE_MOCK) {
    return [...mockSpecialPermissions];
  }
  const res = await fetch(buildUrl({ action: 'getSpecialPermissions' }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function bulkUpdateTeam({ team, status }) {
  if (USE_MOCK) {
    const isAll = team.toUpperCase() === 'ALL';
    const exitTime = status === 'outside' ? Date.now().toString() : '';
    const entryTime = status === 'inside' ? Date.now().toString() : '';
    mockStudents = mockStudents.map(s => {
      if (isAll || s.team === team) {
        mockLogs.push({ 
          studentId: s.id, 
          studentName: s.name, 
          team: s.team, 
          action: status === 'outside' ? 'out' : 'in', 
          actionType: status === 'outside' ? 'out' : 'in',
          timestamp: new Date().toLocaleString('en-IN') 
        });
        return { ...s, status, exitTime, entryTime };
      }
      return s;
    });
    return { success: true };
  }
  const res = await fetch(buildUrl({ action: 'bulkUpdateTeam', team, status }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export function nowTimestamp() {
  return Date.now().toString();
}


