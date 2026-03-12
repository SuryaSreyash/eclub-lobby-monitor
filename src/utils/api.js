const BASE_URL = process.env.REACT_APP_SCRIPT_URL;

function buildUrl(params) {
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  return url.toString();
}

export async function fetchStudents() {
  const res = await fetch(buildUrl({ action: 'getStudents' }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function updateStudent({ id, status, exitTime = '', entryTime = '' }) {
  const res = await fetch(buildUrl({ action: 'updateStudent', id, status, exitTime, entryTime }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function addLog({ studentId, studentName, team, actionType }) {
  const res = await fetch(buildUrl({ action: 'addLog', studentId, studentName, team, actionType }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function fetchLogs() {
  const res = await fetch(buildUrl({ action: 'getLogs' }));
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// Saves exitTime as a clean timestamp number (milliseconds)
export function nowTimestamp() {
  return Date.now().toString();
}