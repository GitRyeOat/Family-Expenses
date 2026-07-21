// Split3 backend — lives inside the shared Google Sheet.
// POST: app sends queued expenses; duplicates (same ID) are ignored, so retries are safe.
// GET:  returns the most recent entries so every phone sees everyone's spending.

const SHEET_NAME = "Expenses";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(["ID", "Timestamp", "Date", "Person", "Amount", "Memo"]);
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getSheet_();
    const data = JSON.parse(e.postData.contents);
    const last = sh.getLastRow();
    const existing = last > 1
      ? new Set(sh.getRange(2, 1, last - 1, 1).getValues().flat().map(String))
      : new Set();
    const added = [];
    (data.entries || []).forEach(function (en) {
      const id = String(en.id);
      if (!existing.has(id)) {
        sh.appendRow([id, en.ts, new Date(en.ts), en.person, Number(en.amount), en.memo || ""]);
        existing.add(id);
        added.push(id);
      }
    });
    return json_({ ok: true, added: added });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const sh = getSheet_();
    const limit = Math.min(Number((e.parameter || {}).limit) || 100, 500);
    const last = sh.getLastRow();
    let rows = [];
    if (last > 1) {
      const start = Math.max(2, last - limit + 1);
      rows = sh.getRange(start, 1, last - start + 1, 6).getValues().map(function (r) {
        return { id: String(r[0]), ts: Number(r[1]), person: r[3], amount: Number(r[4]), memo: r[5] };
      });
    }
    return json_({ ok: true, entries: rows });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
