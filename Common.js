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
  return CardService.newFixedFooter()
    .setPrimaryButton(CardService.newTextButton()
      .setText('Visit Knight Lab Website')
      .setOpenLink(CardService.newOpenLink()
        .setUrl('https://knightlab.northwestern.edu')));
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
      

  const mailmerge_button = CardService.newTextButton()
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
