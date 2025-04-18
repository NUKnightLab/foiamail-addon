/**
 * This file contains functions for updating the status sheet 
 */

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