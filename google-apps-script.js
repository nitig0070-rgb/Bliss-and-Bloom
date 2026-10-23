/**
 * =========================================================================
 * Bliss & Bloom — Google Apps Script for Google Sheets Form Submissions
 * =========================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * -----------------------
 * 1. Open Google Sheets at https://sheets.new (create a new blank spreadsheet).
 * 2. Rename the spreadsheet to: "Bliss & Bloom — Website Submissions".
 * 3. In the top menu, click: Extensions > Apps Script.
 * 4. Delete any code in the editor, and paste this ENTIRE file.
 * 5. Click the "Save" (disk icon) button.
 * 6. Click the blue "Deploy" button (top right) > "New deployment".
 * 7. In the left panel, click the gear icon "Select type" > choose "Web app".
 * 8. Set the following fields:
 *      - Description: "Bliss and Bloom Web App"
 *      - Execute as: "Me" (your Google account)
 *      - Who has access: "Anyone" (crucial so the website can submit without login)
 * 9. Click "Deploy".
 * 10. Click "Authorize access" (choose your Google account, click "Advanced", then "Go to Bliss and Bloom Web App (unsafe)").
 * 11. Copy the "Web app URL" (it looks like: https://script.google.com/macros/s/AKfycb.../exec).
 * 12. Paste that URL into `js/config.js` as `GOOGLE_SHEET_WEBHOOK_URL`
 *     (or paste it into the website's in-browser Cloud Settings modal).
 */

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "success",
      message: "Bliss & Bloom Google Sheets Webhook is active and listening for submissions."
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent writes
  lock.tryLock(10000);

  try {
    var rawData = e.postData ? e.postData.contents : null;
    var data = {};

    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (jsonErr) {
        // Fallback for form-url-encoded data
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var type = (data.type || "contact").toLowerCase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    var timestamp = new Date();

    if (type === "contact") {
      // -------------------------------------------------------------
      // Tab 1: Contact Messages
      // -------------------------------------------------------------
      sheet = getOrCreateSheet(ss, "Contact Messages", [
        "Timestamp", "Name", "Email", "Phone", "Message"
      ]);

      sheet.appendRow([
        timestamp,
        data.name || "N/A",
        data.email || "N/A",
        data.phone || "N/A",
        data.message || "N/A"
      ]);

    } else if (type === "newsletter") {
      // -------------------------------------------------------------
      // Tab 2: Newsletter Subscribers
      // -------------------------------------------------------------
      sheet = getOrCreateSheet(ss, "Newsletter Subscribers", [
        "Timestamp", "Subscriber Email"
      ]);

      sheet.appendRow([
        timestamp,
        data.email || "N/A"
      ]);

    } else if (type === "reservation") {
      // -------------------------------------------------------------
      // Tab 3: Table Reservations
      // -------------------------------------------------------------
      sheet = getOrCreateSheet(ss, "Table Reservations", [
        "Timestamp", "Booking Ref", "Guest Name", "Email", "Phone", "Date", "Time", "Guests", "Occasion", "Special Notes"
      ]);

      sheet.appendRow([
        timestamp,
        data.booking_ref || data.refId || "N/A",
        data.name || "N/A",
        data.email || "N/A",
        data.phone || "N/A",
        data.date || "N/A",
        data.time || "N/A",
        data.guests || 1,
        data.occasion || "Casual Dining",
        data.notes || ""
      ]);

    } else {
      // Default / General
      sheet = getOrCreateSheet(ss, "General Submissions", ["Timestamp", "Raw Data"]);
      sheet.appendRow([timestamp, JSON.stringify(data)]);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        type: type,
        message: "Data successfully recorded into Google Sheet."
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to retrieve an existing sheet or create a new formatted one
 */
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Append and format header row
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#173D32"); // Bliss & Bloom forest green
    headerRange.setFontColor("#FFFFFF");
    headerRange.setHorizontalAlignment("center");
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Set auto width padding
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  return sheet;
}
