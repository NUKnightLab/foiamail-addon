
/**
 * helper function to update request status based on the contents of a thread and its latest message
 * @param {*} thread 
 * @param {*} tracker_entry (do we actually need this...)
 * @param {*} target_entry 
 * @param {*} campaign 
 * @return {null} 
 */
function updateRequestEntry(thread, tracker_entry, target_entry, campaign) {
    target_entry[5] = 'Response Received';
    target_entry[6] = thread.getMessages()[thread.getMessageCount()-1].getDate();
    thread_url = thread.getPermalink();
    target_entry[7] += `, ${thread_url}`;



    thread.addLabel(GmailApp.getUserLabelByName(campaign['name']))
    thread.addLabel(GmailApp.getUserLabelByName(`${campaign['name']}/${target_entry[1]}`))

    thread.removeLabel(GmailApp.getUserLabelByName('Unsorted'))
    return
}

/**
 * Parse thread to find its id tag
 * @param {GmailApp.Thread} thread 
 * @return {string} actual id of the request
 */
function extractRequestId(thread) {
    //for now, using case of latest message in a thread has body text that contains a copy of the request 
    let latest_message = thread.getMessages()[thread.getMessageCount() - 1]
    let text = latest_message.getBody();
    let id = text.split('%@')[1]
    return id
}

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