// Set this to the exact spreadsheet ID from the Google account you want to use.
// You can find it in the sheet URL: https://docs.google.com/spreadsheets/d/PASTE_ID_HERE/edit
var SPREADSHEET_ID = '1YEmRYXCivwZW8maH5jd8AJfp_U5-ESqh7Wrpin31kzo';
var SPREADSHEET_NAME = 'SIH2026'; // fallback only if SPREADSHEET_ID is blank
var STUDENTS_SHEET = 'students';
var LOGS_SHEET = 'logs';
var AUTHORIZERS_SHEET = 'authorizers';
var SPECIAL_PERMISSIONS_SHEET = 'specialPermissions';

/* ── Spreadsheet helper ─────────────────────────────────────── */

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '' && SPREADSHEET_ID !== 'PASTE_SHEET_ID_HERE') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (err) {
      throw new Error('Spreadsheet ID "' + SPREADSHEET_ID + '" is invalid or not accessible from this Apps Script account. Update the ID or use the fallback spreadsheet name.');
    }
  }

  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (!files.hasNext()) throw new Error('Spreadsheet "' + SPREADSHEET_NAME + '" not found in Drive.');
  return SpreadsheetApp.open(files.next());
}

/* ── One-time setup: run this manually once from the editor ─── */

function setupSheets() {
  var ss = getSpreadsheet();

  function ensureSheet(name, headers) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    } else {
      sheet.clearContents(); // wipe existing content (headers + data)
    }
    sheet.appendRow(headers);
    // Style the header row
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4a4a4a')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    return sheet;
  }

  ensureSheet(STUDENTS_SHEET,           ['id', 'name', 'team', 'status', 'exitTime', 'entryTime', 'category']);
  ensureSheet(LOGS_SHEET,               ['studentId', 'studentName', 'team', 'action', 'timestamp']);
  ensureSheet(AUTHORIZERS_SHEET,        ['name']);
  ensureSheet(SPECIAL_PERMISSIONS_SHEET,['team', 'authorizer', 'timestamp']);

  // Remove the default "Sheet1" if it exists and is empty
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('setupSheets() complete — all tabs created in "' + SPREADSHEET_NAME + '".');
}


function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  try {
    var action = e.parameter.action;
    if (action === 'getStudents')           return getStudents();
    if (action === 'updateStudent')         return updateStudent(e.parameter);
    if (action === 'addLog')                return addLog(e.parameter);
    if (action === 'getLogs')               return getLogs();
    if (action === 'getAuthorizers')        return getAuthorizers();
    if (action === 'addSpecialPermission')  return addSpecialPermission(e.parameter);
    if (action === 'getSpecialPermissions') return getSpecialPermissions();
    if (action === 'bulkUpdateTeam')        return bulkUpdateTeam(e.parameter);
    return response({ error: 'Unknown action' });
  } catch(err) {
    return response({ error: err.toString() });
  }
}

function getStudents() {
  var sheet = getSpreadsheet().getSheetByName(STUDENTS_SHEET);
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
  var sheet = getSpreadsheet().getSheetByName(STUDENTS_SHEET);
  if (!sheet) return response({ error: 'students sheet not found' });
  var id = params.id ? params.id.trim() : '';
  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h){ return h.toString().trim(); });
  var idCol     = headers.indexOf('id');
  var statusCol = headers.indexOf('status');
  var exitCol   = headers.indexOf('exitTime');
  var entryCol  = headers.indexOf('entryTime');
  var catCol    = headers.indexOf('category');
  if (idCol === -1) return response({ error: 'id column not found' });
  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol].toString().trim() === id) {
      if (statusCol !== -1 && params.status    !== undefined) sheet.getRange(i+1, statusCol+1).setValue(params.status || '');
      if (exitCol   !== -1 && params.exitTime  !== undefined) sheet.getRange(i+1, exitCol+1).setValue(params.exitTime || '');
      if (entryCol  !== -1 && params.entryTime !== undefined) sheet.getRange(i+1, entryCol+1).setValue(params.entryTime || '');
      if (catCol    !== -1 && params.category  !== undefined) sheet.getRange(i+1, catCol+1).setValue(params.category || '');
      return response({ success: true });
    }
  }
  return response({ error: 'Student not found: ' + id });
}

function addLog(params) {
  var sheet = getSpreadsheet().getSheetByName(LOGS_SHEET);
  if (!sheet) return response({ error: 'logs sheet not found' });
  var ts = new Date().toLocaleString('en-IN');
  sheet.appendRow([params.studentId||'', params.studentName||'', params.team||'', params.actionType||'', ts]);
  return response({ success: true });
}

function getLogs() {
  var sheet = getSpreadsheet().getSheetByName(LOGS_SHEET);
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

/* ── Authorizers ────────────────────────────────────────────── */

function getAuthorizers() {
  var sheet = getSpreadsheet().getSheetByName(AUTHORIZERS_SHEET);
  if (!sheet) return response([]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return response([]);
  // First row is header, rest are names in column A
  var names = data.slice(1).map(function(row) {
    return row[0] ? row[0].toString().trim() : '';
  }).filter(function(n) { return n !== ''; });
  return response(names);
}

/* ── Special Permissions (majority-out overrides) ───────────── */

function addSpecialPermission(params) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SPECIAL_PERMISSIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SPECIAL_PERMISSIONS_SHEET);
    sheet.appendRow(['team', 'authorizer', 'timestamp']);
  }
  var ts = new Date().toLocaleString('en-IN');
  sheet.appendRow([params.team || '', params.authorizer || '', ts]);
  return response({ success: true });
}

function getSpecialPermissions() {
  var sheet = getSpreadsheet().getSheetByName(SPECIAL_PERMISSIONS_SHEET);
  if (!sheet) return response([]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return response([]);
  var headers = data[0].map(function(h) { return h.toString().trim(); });
  var rows = data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i].toString() : ''; });
    return obj;
  });
  return response(rows);
}

/* ── Bulk Update Team (Send on Break) ───────────────────────── */

function bulkUpdateTeam(params) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(STUDENTS_SHEET);
  if (!sheet) return response({ error: 'students sheet not found' });
  var logSheet = ss.getSheetByName(LOGS_SHEET);

  var team = params.team ? params.team.trim() : '';
  var isAll = team.toUpperCase() === 'ALL';
  var status = params.status || 'outside';
  var ts = new Date().toLocaleString('en-IN');
  var exitTime = status === 'outside' ? Date.now().toString() : '';
  var entryTime = status === 'inside' ? Date.now().toString() : '';

  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return h.toString().trim(); });
  var idCol     = headers.indexOf('id');
  var nameCol   = headers.indexOf('name');
  var teamCol   = headers.indexOf('team');
  var statusCol = headers.indexOf('status');
  var exitCol   = headers.indexOf('exitTime');
  var entryCol  = headers.indexOf('entryTime');

  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var rowTeam = data[i][teamCol] ? data[i][teamCol].toString().trim() : '';
    if (isAll || (rowTeam && rowTeam === team)) {
      if (statusCol !== -1) sheet.getRange(i+1, statusCol+1).setValue(status);
      if (exitCol   !== -1) sheet.getRange(i+1, exitCol+1).setValue(exitTime);
      if (entryCol  !== -1) sheet.getRange(i+1, entryCol+1).setValue(entryTime);
      // Log each student
      if (logSheet) {
        var action = status === 'outside' ? 'out' : 'in';
        var studentId   = data[i][idCol]   ? data[i][idCol].toString()   : '';
        var studentName = data[i][nameCol] ? data[i][nameCol].toString() : '';
        logSheet.appendRow([studentId, studentName, rowTeam, action + ' (team break)', ts]);
      }
      count++;
    }
  }
  return response({ success: true, updated: count });
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
