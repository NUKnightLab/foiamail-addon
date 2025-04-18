


function updateCampaignTracker(e) {
    let campaign = JSON.parse(e.parameters.camp);
    let unsorted_label = GmailApp.getUserLabelByName('Unsorted');

    let unsorted_threads = unsorted_label.getThreads();

    let tracker_sheet = SpreadsheetApp.openByUrl(campaign['tracker']).getSheets()[0];
    let tracker_range = tracker_sheet.getDataRange();
    let tracker_values = tracker_range.getValues();
    let target_values = tracker_range.getValues();

    for (var thread of unsorted_threads) {

        //helper function because we'll have to enumerate cases
        id = extractRequestId(thread);
        for (var i = 1;i < tracker_values.length; i++) {
            var tracker_entry = tracker_values[i];
            var target_entry = target_values[i]
            if (target_entry[0] == id) {
                //helper function because we'll have to enumerate cases
                updateRequestEntry(thread, tracker_entry, target_entry, campaign);
            }
        }

    }
    //flush the changes to tracker spreadsheet
    tracker_range.setValues(target_values)
    return
}


function updateAllTrackers (e) {
    
    let props = PropertiesService.getScriptProperties();
    let open_campaigns_str = props.getProperty('openCampaigns');
    let open_campaigns = JSON.parse(open_campaigns_str);

    let unsorted_label = GmailApp.getUserLabelByName('Unsorted');
    let unsorted_threads = unsorted_label.getThreads();    
}


//trying to wrap stuff around with triggers and stuff 
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