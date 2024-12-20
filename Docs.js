const PROPERTY_SPREADSHEET_ID = 'foiamail.spreadsheet_id'

function extractHeaders(ss) {
    const sheet = ss.getSheets()[0];

    // This represents ALL the data
    const range = sheet.getDataRange();
    const values = range.getValues();

    return values[0]
}

/**
 * TODO: make this insert a placeholder token in the document
 * @param {*} params a JSON object including our chosen parameters and other metadata
 */
function insertHeaderPlaceholder(params) {
    const html_output = HtmlService
        .createHtmlOutput(
            // JSON.stringify(params)
            params.parameters.header,
        )
        .setWidth(250)
        .setHeight(300);

    DocumentApp.getUi().showModalDialog(html_output,'woopitydoopdop')
}

function onDocsHomepage(e){
    const props = PropertiesService.getScriptProperties()
    const spreadsheet_id = props.getProperty(PROPERTY_SPREADSHEET_ID)
    let ss;
    if (spreadsheet_id) {
        ss = SpreadsheetApp.openById(spreadsheet_id)
    }    
    let docsEventObject = e['docs'];

    let builder = CardService.newCardBuilder();

    // Assemble the widgets and return the card.
    var card = CardService.newCardBuilder()
        .setFixedFooter(createFixedFooter());

    if (ss) {
        const has_spreadsheet_section = CardService.newCardSection()
            .addWidget(CardService.newTextParagraph().setText(
                `Spreadsheet selected: [${ss.getName()}]`
            ))
            .addWidget(
                CardService.newTextButton()
                    .setText('Open Spreadsheet')
                    .setOpenLink(
                        CardService.newOpenLink()
                            .setUrl(ss.getUrl())
                    )
            )
        card.addSection(has_spreadsheet_section)

        const headers = extractHeaders(ss)
        console.log(`headers: ${headers}`)
        const insert_placeholders_section = CardService.newCardSection()
        insert_placeholders_section.setHeader("Insert placeholders")
        // insert_placeholders_section.addWidget(
        //     CardService.newTextParagraph().setText(`headers: ${headers}`)
        // )
        for (let i = 0; i < headers.length; i++) {
            const h = headers[i];
            insert_placeholders_section.addWidget(
                CardService.newTextButton()
                                .setText(h)
                                .setOnClickAction(
                                    CardService.newAction()
                                        .setFunctionName('insertHeaderPlaceholder') 
                                                .setParameters(
                                                    {'header': h}
                                                )
                        ))

        }
        // headers.forEach(element => {
        //     if (!element.trim().match(/^$/)) { // don't mess with blanks
        //         insert_placeholders_section.addWidget(
        //             CardService.newTextButton()
        //                 .setText(element)
        //         )
        //     }
        // });
        card.addSection(insert_placeholders_section)
    }

    const link_sheet_button = CardService.newTextButton()
        .setText('Select Google Sheets document for FOIAMail Merge')
        .setOnClickAction(
            CardService.newAction()
                .setFunctionName('showPicker'));

    card.addSection(
        CardService.newCardSection()
                    .addWidget(link_sheet_button)
    )


    return card.build()
}

function pickerSelectionHandler(e) {
    const props = PropertiesService.getScriptProperties()
    props.setProperty(PROPERTY_SPREADSHEET_ID,e.document.id)
    var builder = CardService.newCardBuilder();
    // var cardSection = CardService.newCardSection();
    // cardSection.setHeader('Picker Picked')
    // cardSection.addWidget(
    //     CardService.newTextParagraph().setText(

    //     )
    // )
    // builder.addSection(cardSection)
    // console.log('pickerSelectionHandler')
    // built = builder.build()
    // console.log(built)
    DocumentApp.getUi().showSidebar
    (HtmlService
        .createHtmlOutput(`<b>${JSON.stringify(e)}}</b>`)
        .setTitle(STANDARD_SIDEBAR_TITLE)
)
}

/**
 * For the current document, display either its quota information or
 * a button that allows the user to provide permission to access that
 * file to retrieve its quota details.
 *
 * @param e The event containing information about the current document
 * @return {Card}
 */
function createAddOnViewExample(e) {
    var docsEventObject = e['docs'];
    var builder = CardService.newCardBuilder();

    var cardSection = CardService.newCardSection();
    if (docsEventObject['addonHasFileScopePermission']) {
        cardSection.setHeader(docsEventObject['title']);
        // This add-on uses the recommended, limited-permission `drive.file`
        // scope to get granular per-file access permissions.
        // See: https://developers.google.com/drive/api/v2/about-auth
        // If the add-on has access permission, read and display its quota.
        cardSection.addWidget(
            CardService.newTextParagraph().setText(
                "here's some text"));
    } else {
        // If the add-on does not have access permission, add a button that
        // allows the user to provide that permission on a per-file basis.
        cardSection.addWidget(
            CardService.newTextParagraph().setText(
                "The add-on needs permission to access this file's quota."));

        var buttonAction = CardService.newAction()
            .setFunctionName("onRequestFileScopeButtonClicked");

        var button = CardService.newTextButton()
            .setText("Request permission")
            .setOnClickAction(buttonAction);

        cardSection.addWidget(button);
    }
    return builder.addSection(cardSection).build();
}


/**
 * Read the Google Doc identified by the given ID.
 * Returns an object with two properties:
 * `subject` and `body`
 * @param {String} doc_id 
 * @returns {Object} parsed
 */
function parseDocToTemplate(doc_id) {
    let doc = DocumentApp.openById(doc_id);
    let body = doc.getBody()
    let text = body.getText()
    return {
        body: text,
        subject: `We'll parse the subject later ${new Date().toDateString()}`
    }
}


/**
 * Displays an HTML-service dialog in Google Sheets that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
    var html = HtmlService.createHtmlOutputFromFile('Picker.html')
        .setWidth(600)
        .setHeight(425)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    DocumentApp.getUi().showModalDialog(html, 'Select Spreadsheet');
}

function getOAuthToken() {
    DriveApp.getRootFolder();
    return ScriptApp.getOAuthToken();
}
