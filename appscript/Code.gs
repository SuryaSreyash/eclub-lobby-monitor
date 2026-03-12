var STUDENTS_SHEET = 'students';
var LOGS_SHEET = 'logs';

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  try {
    var action = e.parameter.action;
    if (action === 'getStudents')   return getStudents();
    if (action === 'updateStudent') return updateStudent(e.parameter);
    if (action === 'addLog')        return addLog(e.parameter);
    if (action === 'getLogs')       return getLogs();
    return response({ error: 'Unknown action' });
  } catch(err) {
    return response({ error: err.toString() });
  }
}

function getStudents() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STUDENTS_SHEET);
  if (!sheet) return response({ error: 'students sheet not found' });
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return response([]);
  var headers = data[0].map(function(h){ return h.toString().trim(); });
  var rows = data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i){ obj[h] = row[i] !== undefined ? row[i].toString() : ''; });
    return obj;
  }).filter(function(r){ return r.id && r.id.trim() !== ''; });
  return response(rows);
}

function updateStudent(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STUDENTS_SHEET);
  if (!sheet) return response({ error: 'students sheet not found' });
  var id = params.id ? params.id.trim() : '';
  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h){ return h.toString().trim(); });
  var idCol     = headers.indexOf('id');
  var statusCol = headers.indexOf('status');
  var exitCol   = headers.indexOf('exitTime');
  var entryCol  = headers.indexOf('entryTime');
  if (idCol === -1) return response({ error: 'id column not found' });
  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol].toString().trim() === id) {
      if (statusCol !== -1) sheet.getRange(i+1, statusCol+1).setValue(params.status || '');
      if (exitCol   !== -1) sheet.getRange(i+1, exitCol+1).setValue(params.exitTime || '');
      if (entryCol  !== -1) sheet.getRange(i+1, entryCol+1).setValue(params.entryTime || '');
      return response({ success: true });
    }
  }
  return response({ error: 'Student not found: ' + id });
}

function addLog(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET);
  if (!sheet) return response({ error: 'logs sheet not found' });
  var ts = new Date().toLocaleString('en-IN');
  sheet.appendRow([params.studentId||'', params.studentName||'', params.team||'', params.actionType||'', ts]);
  return response({ success: true });
}

function getLogs() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET);
  if (!sheet) return response({ error: 'logs sheet not found' });
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return response([]);
  var headers = data[0].map(function(h){ return h.toString().trim(); });
  var rows = data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i){ obj[h] = row[i] !== undefined ? row[i].toString() : ''; });
    return obj;
  });
  return response(rows.reverse().slice(0, 100));
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
