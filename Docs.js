function onDocsHomepage(e){
    // let docsEventObject = e['docs'];
    // let builder = CardService.newCardBuilder();
    // console.log('onDocsHomepage')
    // console.log(docsEventObject)
    // builder.setFixedFooter(createFixedFooter())

    // return builder.build()
    return createAddOnView(e)
}

function createAddOnView(e) {
    var docsEventObject = e['docs'];
    var builder = CardService.newCardBuilder();

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
