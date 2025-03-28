/**
 * FOIAMail: a Google Workspace add-on to support journalists making 
 * Freedom of Information Act requests.
 */

const STANDARD_SIDEBAR_TITLE = 'FOIAMail'

const MAGIC_FOLDER_NAME = 'FOIAMail'

const ICON_URL = 'https://uploads.knightlab.com/paper_airplane.png'

/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomepage(e) {
  initCheck();
  console.log('onHomepage');
  console.log(e);
  return createHomepageCard();
}

/**
 * Search Google Drive for this user's templates folder. 
 * @return {Folder} The user's folder as an object, or null if they don't have one.
 */
function findFOIAMailFolder() {
  // maybe later we add a property or tag so that if the name is changed, it's ok?
  // For now just return the first one. That might not scale either.
  const folders = DriveApp.searchFolders(`title = "${MAGIC_FOLDER_NAME}"`);
  while (folders.hasNext()) {
    const folder = folders.next();
    return folder
  }
  return null
}
function createFOIAMailFolder() {
  const folder = DriveApp.createFolder(MAGIC_FOLDER_NAME);
  return folder;
}

/**
 * Creates a fixed footer with a primary button
 * @param {string} buttonText The text for the primary button
 * @param {string} url The URL to open when clicked
 * @return {CardService.FixedFooter} The assembled footer
 */
function createFixedFooter() {
  let footer = CardService.newFixedFooter()
                .setPrimaryButton(CardService.newTextButton()
                  .setText('Visit Knight Lab Website')
                  .setOpenLink(CardService.newOpenLink()
                    .setUrl('https://knightlab.northwestern.edu')))
  footer.setSecondaryButton(CardService.newTextButton()
    .setText('View properties')
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName('showPropertiesCard')));
  return footer
}

function composeMailMergeDrafts() {
  // TODO: get a template doc ID that isn't hard-coded
  // maybe do it from the Docs UI, and ask for the subject
  // instead of encoding it somehow?
  let doc_id = '1GIohdUNMmRgtfwMkISnhws6sSSam7MzzTeuuhsNA-QQ'
  const parsed = parseDocToTemplate(doc_id)
  let sheets_id = '1OIPq4yqGESxSsjyy4po00Qc8sAQDdntCfUb9gswWqS8'
  let rows = getSpreadsheetAsObjects(sheets_id)
  let label = GmailApp.getUserLabelByName('FOIAMail')
  if (!label) {
    label = GmailApp.createLabel('FOIAMail')
  }

  rows.forEach(row => {
    let body = evalTemplate(parsed.body, row)
    let subject = evalTemplate(parsed.subject, row)
    let draft = GmailApp.createDraft(
      row.email, // this doesn't seem robust
      subject,
      body)

    // TODO: per "campaign" labels?
    draft.getMessage().getThread().addLabel(label)

    });
    return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification()
      .setText(`Created ${rows.length} drafts for you`),
    )
    .build();

}

function evalTemplate(tmpl, ctx) {
  Object.keys(ctx).forEach(k => {
    tmpl = tmpl.replaceAll(`{{${k}}}`, ctx[k])
  })
  return tmpl
}



/**
 * Initialize FOIAMail properties if needed
 * @return {null} 
 */
function initCheck() {
  let props = PropertiesService.getScriptProperties();
  console.log(props);
  if (!props.getProperty('initialized')) {
    // Very very first time using FOIAMail
    // We need to create a property for an object of campaign classes
    // Then, mark this as initialized (set to true)

    props.setProperty('openCampaigns', JSON.stringify([]))
    props.setProperty('archivedCampaigns', JSON.stringify([]))
    //props.setProperty('rootId', '1OxoVVN5t7gZ_koZqxmnTUinC1PmI4hmL') //unhardcode later (do we need this... lowk no)
    props.setProperty('initialized', JSON.stringify({name: true}))
    props.setProperty('readyDraftIds', JSON.stringify([]))
    
    // What other data do we need? 

    //Random thing I guess we should initialize when they start using the service
    GmailApp.createLabel('Unsent Request')
  }
  return
}

/**
 * Reset data associated with the user's FOIAMail (mainly for testing right now)
 * @return {null}
 */
function reset() {

  //for now, just delete all properties (does this delete the campaign metadata stored inside?)

  props = PropertiesService.getScriptProperties();
  props.deleteAllProperties();

  return;

}

/**
 * Delete a Campaign
 * @return {null}
 */
function deleteCampaign() {
  return
}



/**
 * Create a card that shows global FOIAMail properties
 * @return {navigation} navigation to the properties card
 */
function createPropertiesCard() {

  let props = PropertiesService.getScriptProperties();
  let info_section = CardService.newCardSection();

  if (props.getKeys().length > 0) {
  
    for (var i = 0; i < props.getKeys().length; i++) {
      let key = props.getKeys()[i]

      let text = `${key}: ${props.getProperty(key)}`

      /*
      let val = JSON.parse(props.getProperty(key));
      let text;
      if (typeof(val) == 'object') { //fix for 'initialized' property
        text = `${key} : `
        for (var i = 0; i < val.length; i++)
          text += `${val[i]['name']} | `
      }
      else {
        text = `${key} : ${val}`
      }
      */
      
      let graf = CardService.newTextParagraph()
                            .setText(text)
      info_section.addWidget(graf)
    }
  }
  else {
    info_section.addWidget(CardService.newTextParagraph().setText('no properties'))
  }

  let delete_button = CardService.newTextButton()
                                 .setText('Delete all properties')
                                 .setOnClickAction(CardService.newAction()
                                                              .setFunctionName('reset'))
  
  let delete_section = CardService.newCardSection()
                                  .addWidget(delete_button)

  let card = CardService.newCardBuilder()
    .addSection(info_section)
    .addSection(delete_section)

  return card.build()
}

/**
 * Create a card that shows global FOIAMail properties
 * @return {CardService.Card} Assembled card to build
 */
function showPropertiesCard() {
  return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(createPropertiesCard()))
      .build();
}

/**
 * Create the campaign and a card to show next steps
 * @return {null}
 */
function createCampaign(e) {
  
  let input = e.formInput
  
  //Create new campaign 
  //Need to add error handling for same name campaigns
  //OR no same name campaigns
  //Running into some issues clasp pushing .ts files so changing campaign to just an object
  
  let camp = {};
  camp['name'] = input.campaign_name;
  camp['description'] = input.campaign_desc;
  camp['template'] = input.campaign_temp;

  //Create new gmail label, tracker and folder for this campaign
  //Set the campaign class with this info (urls for now)
  GmailApp.createLabel(camp['name']);
  let folder = DriveApp.createFolder(camp['name']);
  folder.moveTo(findFOIAMailFolder());
  camp['folder'] = folder.getId();

  let tracker_sheet = SpreadsheetApp.create('Status Tracker');
  DriveApp.getFileById(tracker_sheet.getId()).moveTo(folder);
  camp['tracker'] = tracker_sheet.getUrl();
  let track_sheet = tracker_sheet.getSheets()[0];
  track_sheet.appendRow(['request_id', 
                         'agency_name',
                         'agency_email',
                         'status', 
                         'thread_link', 
                         'folder_link']);
  

  let generator_sheet = SpreadsheetApp.create('Request Generator');
  DriveApp.getFileById(generator_sheet.getId()).moveTo(folder);
  camp['generator'] = generator_sheet.getUrl();
  let gen_sheet = generator_sheet.getSheets()[0];
  gen_sheet.appendRow(['agency_name', 'agency_email']);


  //Add this campaign to the script properties

  let props = PropertiesService.getScriptProperties();
  let open_campaigns_str = props.getProperty('openCampaigns');
  let open_campaigns = JSON.parse(open_campaigns_str);
  open_campaigns.push(camp);
  props.setProperty('openCampaigns', JSON.stringify(open_campaigns));
  //props.setProperty('activeCampaign', camp);

  //Make the campaign home page card
  //let's make this a separate function? 
  
  return showActiveCampaignCard1(camp);  
}
/** 
 * Creates card for new campaign
 * @return {CardService.Card} The assembled card.
 */
function createNewCampaignCard() {
  
  // Top section
  let top_text = "Get started on your new FOIAMail campaign"
  let top_paragraph = CardService.newTextParagraph()
    .setText(top_text)
  var top_section = CardService.newCardSection()
    .addWidget(top_paragraph)

  // Naming section
  const name_input = CardService.newTextInput()
                             .setFieldName('campaign_name')
                             .setTitle('Pick a name for your campaign')
                             .setValue('My Campaign')
  var name_section = CardService.newCardSection()
    .addWidget(name_input)

  // Description section
  const description_input = CardService.newTextInput()
                             .setFieldName('campaign_desc')
                             .setTitle('Describe your campaign')
                             .setHint('My campaign is for tktk')
                             .setMultiline(true)
  var description_section = CardService.newCardSection()
    .addWidget(description_input)
  
  // Template picker section
  
  let template_text = 'Pick a template (for now, input URL)'
  
  let template_paragraph = CardService.newTextParagraph()
    .setText(template_text)

  
  const template_input = CardService.newTextInput()
    .setFieldName('campaign_temp')
    .setTitle('Link the url to the google doc for your campaign')
    .setHint('https://...')
  

  let picker_button = CardService.newTextButton()
    .setText("Pick template")
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName('showFilePicker'))
  

  var template_section = CardService.newCardSection()
    .addWidget(template_paragraph)
    .addWidget(template_input)
    //.addWidget(picker_button)

  // Submit section
  
  let submit_button = CardService.newTextButton()
    .setText('Submit')
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName('createCampaign'))
                                 
  
  let submit_section = CardService.newCardSection()
    .addWidget(submit_button)

                        
  
  var card = CardService.newCardBuilder()
    .addSection(top_section)
    .addSection(name_section)
    .addSection(description_section)
    .addSection(template_section)
    .addSection(submit_section)

    .setFixedFooter(createFixedFooter());
  return card.build()
}
/**
 * @param {*} e event with potential parameters
 * @returns a navigation to the New Campaign card
 */
function showNewCampaignCard(e) {
  return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(createNewCampaignCard()))
      .build();
}

/**
 * Create a campaign card for the active campaign
 * @return {CardService.Card} Assembled card to build
 */
function createActiveCampaignCard(campaign) {
  //Top section
  let top_paragraph = CardService.newTextParagraph()
    .setText(campaign['name'])
  var top_section = CardService.newCardSection()
    .addWidget(top_paragraph)

  //Open Tracker
  let tracker_button = CardService.newTextButton()
    .setText('Open Status Sheet')
    .setOpenLink(CardService.newOpenLink()
      .setUrl(campaign['tracker']))

  //Open Folder 
  let folder_button = CardService.newTextButton()
    .setText('Open Campaign Folder')
    .setOpenLink(CardService.newOpenLink()
      .setUrl(DriveApp.getFolderById(campaign['folder'])
                      .getUrl()))

  //Change Template

  //Generate Request Drafts
  let generate_button = CardService.newTextButton()
    .setText('Generate Requests')
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName('showGeneratorCard')
                                 .setParameters({camp: JSON.stringify(campaign)}))

  let actions_section = CardService.newCardSection()
    .addWidget(tracker_button)
    .addWidget(folder_button)
    .addWidget(generate_button)

  //Delete Campaign
  let delete_button = CardService.newTextButton()
    .setText('Delete Campaign')
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName('deleteCampaign'))
  let delete_section = CardService.newCardSection()
    .addWidget(delete_button)

  //Compile the card
  var card = CardService.newCardBuilder()
    .addSection(top_section)
    .addSection(actions_section)
    .addSection(delete_section)
    .setFixedFooter(createFixedFooter())

  return card.build()

}
/**
 * @param {*} e event with potential parameters
 * @returns {navigation} a navigation to the New Campaign card
 */
function showActiveCampaignCard(e) {
  return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(createActiveCampaignCard(JSON.parse(e.formInput.selection))))
      .build();
}
/**
 * This seems so wrong but just a workaround for right now
 * @param {*} e event with potential parameters
 * @returns {navigation} a navigation to the New Campaign card
 */
function showActiveCampaignCard1(campaign) {
  return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().popToRoot())
      .setNavigation(CardService.newNavigation().pushCard(createActiveCampaignCard(campaign)))
      .build();
}

/**
 * @returns {CardService.Card} Assembled generator interface card
 */
function createGeneratorCard(campaign) {
  //Top section
  let top_paragraph = CardService.newTextParagraph()
    .setText(campaign['name'])
  var top_section = CardService.newCardSection()
    .addWidget(top_paragraph)
  
  //Instructions section
  let instruction_paragraph = CardService.newTextParagraph()
    .setText(`
      Instructions\n
      1. Copy paste agency names and email addresses into the generator spreadsheet\n
      2. Create request drafts\n
      3. Send request drafts (note that restarting this process before sending will result in duplicate drafts)
      `)
  var instruction_section = CardService.newCardSection()
    .addWidget(instruction_paragraph)

  //Open Generator
  let generator_button = CardService.newTextButton()
    .setText('Open Generator')
    .setOpenLink(CardService.newOpenLink()
      .setUrl(campaign['generator']))
  //Draft Requests
  let draft_button = CardService.newTextButton()
    .setText('Draft Requests')
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName('draftRequests')
                                 .setParameters({campaign: JSON.stringify(campaign)}))
  //Send Requests
  let send_button = CardService.newTextButton()
    .setText('Send Request Drafts')
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName('sendDraftRequests')
                                 .setParameters({campaign: JSON.stringify(campaign)}))
  let generate_section = CardService.newCardSection()
                                    .addWidget(generator_button)
                                    .addWidget(draft_button)
                                    .addWidget(send_button)
  let card = CardService.newCardBuilder()
                        .addSection(top_section)
                        .addSection(instruction_section)
                        .addSection(generate_section)
                        .setFixedFooter(createFixedFooter())
              
  return card.build()
}
/**
 * @returns {navigation} a navigation to the New Campaign card
*/ 
function showGeneratorCard(e) {
  return CardService.newActionResponseBuilder()
  .setNavigation(CardService.newNavigation().pushCard(createGeneratorCard(JSON.parse(e.parameters.camp))))
  .build();
}

/**
 * Create drafts for requests and store their ids in properties
 * @returns {null}
 */
function draftRequests(e) {
  //deserialize json for active campaign data
  let campaign = JSON.parse(e.parameters.campaign);

  //get template info
  var template = DocumentApp.openByUrl(campaign['template']);
  var text = template.getBody()
                     .getText();

  //get generator info
  let sheet = SpreadsheetApp.openByUrl(campaign['generator']).getSheets()[0];
  let range = sheet.getRange('A2:B');
  let data = range.getValues();

  //get parent label
  let par_label = GmailApp.getUserLabelByName(campaign['name']);

  //loop through generator rows and create drafts, applying labels 
  for (var i = 0; i < sheet.getLastRow() - 1; i++) {
    var agency_name = data[i][0]; //unhardcode later!
    var agency_address = data[i][1];
    var draft = GmailApp.createDraft(agency_address, 'Request to inspect records', text);
    
    var thread = draft.getMessage().getThread();
    var new_label_str = `${campaign['name']}/${agency_name}`;
    var new_label = GmailApp.createLabel(new_label_str);

    thread.addLabel(par_label);
    thread.addLabel(new_label);
    //thread.addLabel(GmailApp.getUserLabelByName('Unsent Request')); //wait we don't need this right...
  }


}

/**
 * Send pending requests for the currently active campaign
 * @returns {null}
 */

function sendDraftRequests(e) {
  //Deserialize the json for campaign
  let campaign = JSON.parse(e.parameters.campaign);

  //Grab the unsent messages and parent label
  let all_drafts = GmailApp.getDrafts();
  let par_label = GmailApp.getUserLabelByName(campaign['name']);

  //Grab generator and status tracker sheet info
  let generator_sheet = SpreadsheetApp.openByUrl(campaign['generator']).getSheets()[0];
  let range = generator_sheet.getRange('A2:B');
  let generator_data = range.getValues();


  let generator_last_row = generator_sheet.getLastRow();

  let tracker_sheet = SpreadsheetApp.openByUrl(campaign['tracker']).getSheets()[0];

  for (var d of all_drafts) {
    //Check if this draft is for this campaign
    if (d.getMessage().getThread().getLabels().includes(par_label)) {
      var old_labels = d.getMessage().getThread().getLabels();
      
      //Send message in between because doesn't d lowk disappear after this?
      var message = d.send();
      
      //Cuz apparently we have to re-add labels...
      for (var l of old_labels) {
        message.getThread().addLabel(l);
      }

      let agency_name;
      //search for the agency name (VERY BAD THIS IS O(DRAFTS^2) COMPLEXITY)
      for (var i = 0; i < generator_last_row; i++) {
        if (generator_data[i][1] == message.getTo()) { //unhardcode
          agency_name = generator_data[i][0];
          break;
        } 
  
      }

      //Make request folder and fill in status tracker (TODO: add pdfing of initial request)

      let sub_folder = DriveApp.createFolder(agency_name);
      let par_folder = DriveApp.getFolderById(campaign['folder']);
      sub_folder.moveTo(par_folder);

      tracker_sheet.appendRow(['for later', agency_name, message.getTo(), 'sent', message.getThread().getPermalink(), sub_folder.getUrl()])

    }
  }



}




/**
 * Creates the card for the home page
 * @return {CardService.Card} The assembled card.
 */
function createHomepageCard() {
  
  let folder = findFOIAMailFolder()
  let card_text
  if (folder) {
    card_text = "Seems like you've been here before"
  } else {
    card_text = "Welcome to FOIAMail"
    folder = createFOIAMailFolder()
  }

  let folder_opener_button = CardService.newTextButton()
    .setText('Open FOIAMail Folder')
    .setOpenLink(CardService.newOpenLink()
      .setUrl(folder.getUrl()))

  let paragraph = CardService.newTextParagraph()
    .setText(card_text)


  let new_campaign_button = CardService.newTextButton()
    .setText('New Campaign')
    .setOnClickAction(
      CardService.newAction()
                 .setFunctionName('showNewCampaignCard')
    )
  

  // Resume Campaign Selection Section
  const selection_input = CardService.newSelectionInput()
                                     .setType(CardService.SelectionInputType.DROPDOWN)
                                     .setTitle('Pick your campaign')
                                     .setFieldName('selection')

  let open_campaigns = JSON.parse(PropertiesService.getScriptProperties()
                                                     .getProperty('openCampaigns'))
  if (open_campaigns != []) {
    for (var i = 0; i < open_campaigns.length; i++) {
      selection_input.addItem(open_campaigns[i]['name'], JSON.stringify(open_campaigns[i]), false)
    }
  }
  
  let resume_campaign_button = CardService.newTextButton()
    .setText('Resume Campaign')
    .setOnClickAction(
      CardService.newAction()
                 .setFunctionName('showActiveCampaignCard')
    )
  
  let selection_section = CardService.newCardSection()
                                     .addWidget(selection_input)
                                     .addWidget(resume_campaign_button)

  

  let mailmerge_button = CardService.newTextButton()
    .setText('Mail Merge')
    .setOnClickAction(
      CardService.newAction()
                 .setFunctionName('composeMailMergeDrafts'));


  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
    .addWidget(paragraph)
    .addWidget(folder_opener_button)
  var card = CardService.newCardBuilder()
    .addSection(section)
    .addSection(CardService.newCardSection()
      .addWidget(mailmerge_button))
    .addSection(CardService.newCardSection()
      .addWidget(new_campaign_button))
    .addSection(selection_section)
    .setFixedFooter(createFixedFooter());
  return card.build()
  
}




/**
 * Creates a card with an image of a cat, overlayed with the text.
 * @param {String} text The text to overlay on the image.
 * @param {Boolean} isHomepage True if the card created here is a homepage;
 *      false otherwise. Defaults to false.
 * @return {CardService.Card} The assembled card.
 */
function createCatCard(text, isHomepage) {
  // Explicitly set the value of isHomepage as false if null or undefined.
  if (!isHomepage) {
    isHomepage = false;
  }

  // Use the "Cat as a service" API to get the cat image. Add a "time" URL
  // parameter to act as a cache buster.
  var now = new Date();
  // Replace forward slashes in the text, as they break the CataaS API.
  var caption = text.replace(/\//g, ' ');
  var imageUrl =
    Utilities.formatString('https://cataas.com/cat/says/%s?time=%s',
      encodeURIComponent(caption), now.getTime());
  var image = CardService.newImage()
    .setImageUrl(imageUrl)
    .setAltText('Meow')

  // Create a button that changes the cat image when pressed.
  // Note: Action parameter keys and values must be strings.
  var action = CardService.newAction()
    .setFunctionName('onChangeCat')
    .setParameters({ text: text, isHomepage: isHomepage.toString() });
  var button = CardService.newTextButton()
    .setText('Change cat')
    .setOnClickAction(action)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
    .addButton(button);

  // Create a footer to be shown at the bottom.
  var footer = createFixedFooter('Powered by cataas.com', 'https://cataas.com');

  var paragraph = CardService.newTextParagraph().setText(`${caption} in Common.js`)

  // Assemble the widgets and return the card.
  var section = CardService.newCardSection()
    .addWidget(paragraph)
    .addWidget(buttonSet);
  var card = CardService.newCardBuilder()
    .addSection(section)
    .setFixedFooter(footer);

  if (!isHomepage) {
    // Create the header shown when the card is minimized,
    // but only when this card is a contextual card. Peek headers
    // are never used by non-contexual cards like homepages.
    var peekHeader = CardService.newCardHeader()
      .setTitle('Contextual Cat')
      .setImageUrl(ICON_URL)
      .setSubtitle(text);
    card.setPeekCardHeader(peekHeader)
  }

  return card.build();
}

/**
 * Callback for the "Change cat" button.
 * @param {Object} e The event object, documented {@link
 *     https://developers.google.com/gmail/add-ons/concepts/actions#action_event_objects
 *     here}.
 * @return {CardService.ActionResponse} The action response to apply.
 */
function onChangeCat(e) {
  console.log(e);
  // Get the text that was shown in the current cat image. This was passed as a
  // parameter on the Action set for the button.
  var text = e.parameters.text;

  // The isHomepage parameter is passed as a string, so convert to a Boolean.
  var isHomepage = e.parameters.isHomepage === 'true';

  // Create a new card with the same text.
  var card = createCatCard(text, isHomepage);

  // Create an action response that instructs the add-on to replace
  // the current card with the new one.
  var navigation = CardService.newNavigation()
    .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
    .setNavigation(navigation);
  return actionResponse.build();
}
