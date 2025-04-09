

function updateTracker (spreadsheet) {
    

    
}

function processSpreadsheet (e) {
    const ss = e.source;
    SpreadsheetApp.getUi().alert('Hello, world');
}

function createTrackerOpenTrigger(e) {
    const ss = SpreadsheetApp.openById('1alC0eNVBq45Zk0l_s1PaeChokfRsD82IIVq2WyEG6ds');
    ScriptApp.newTrigger('processSpreadsheet')
        .forSpreadsheet(ss)
        .onOpen()
        .create();
  }