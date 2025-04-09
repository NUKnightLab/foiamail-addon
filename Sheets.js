/**
 * Given a spreadsheet ID, return an array of objects
 * representing the data in the sheet.
 * @param {String} doc_id
 * @returns {Array} rows
 */
function getSpreadsheetAsObjects(doc_id) {
    const ss = SpreadsheetApp.openById(doc_id)
    const sheet = ss.getSheets()[0];

    // This represents ALL the data
    const range = sheet.getDataRange();
    const values = range.getValues();

    const header = values[0]
    let rows = []
    // This logs the spreadsheet in CSV format with a trailing comma
    for (let i = 1; i < values.length; i++) {
        let row = values[i];
        let obj = {}
        for (let j = 0; j < header.length; j++) {
            if (header[j].trim()) { // in case we have blank columns?
                obj[header[j]] = row[j]
            }
        }
        rows.push(obj)
    }
    return rows
} 


/**
 * @param {*} e some event
 * @returns {null}
 */
function onOpen(e) {
    SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
      .createMenu('Custom Menu')
      .addItem('First item', 'menuItem1')
      .addToUi();
}

