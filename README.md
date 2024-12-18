# foiamail-addon
A Google Workspace add-on to support journalists making FOIA requests

## Developing
We use the [`clasp` command line tool](https://developers.google.com/apps-script/guides/clasp) to push code changes to Google App Scripts.

Start by cloning this repository, if you haven't.

**You may want to create a separate Google account for testing**, to make sure that nothing that the app does inadvertently affects your primary account.

### Install clasp
`clasp` is a command line tool that helps us ensure consistency when making changes to the Apps Script project. 

```bash
npm install @google/clasp -g
clasp login
```

Then, in the git repo directory, `clasp clone` the project using the correct script ID.
```
clasp clone 1Z0kUz4KJ3sOGYUeSdbG5WBZS57ubBDM_hcmXsIsJCilYGTtYt7Ygf5_1
```

### Deploy the add-on

While the add-on is in development, it can't be installed from the public Google Add-ons website. 

Instead,each developer must make their own test deployment from the [Google App Scripts editor for this project](https://script.google.com/home/projects/1Z0kUz4KJ3sOGYUeSdbG5WBZS57ubBDM_hcmXsIsJCilYGTtYt7Ygf5_1/edit). See [Test and debug Apps Script Google Workspace add-ons](https://developers.google.com/workspace/add-ons/how-tos/testing-workspace-addons) for instructions. 

While the app is in testing mode, in order to grant the add-on permission to access your GMail, etc, your address must be added to the Google Cloud test users list by Joe Germuska. You can still deploy the add-on but you'll get an error when you try to use it.

If you want to make sure that you've deployed what you meant to deploy, you can edit the `.addons.common.name` property in `appsscript.json`. After this (or any change you want to try on the website), run `clasp push` Then when you reload a GMail or other page where the add-on is relevant, you should see the name change, or other changes you've made.

We're still working out how test deployments work among collaborators! It seems that you can use `clasp` to create versioned, named deployments and choose those from the Apps Script web page, but we don't have a practice around that yet.

### Code organization

Apps Script allows you to have any number of JavaScript files. There is no need to import functions or other symbols from one into another. At the moment, I'm not sure about the order of processing, but since most everything important should be inside function declarations, it probably doesn't matter.

Try to keep Google app-specific functions in the appropriate files (eg `Gmail.js` and `Drive.js` but don't duplicate shared code -- use `Common.js` or we may choose to have more shared code files as things develop.)

### Tips for collaboration

* If you edit files using the web-based Apps Script editor, you must still pull them to your local machine (using `clasp pull`) so that they can be pushed to the GitHub repository.


## Longer-term to-dos
* create a foiamail.knightlab.com website
    * create an application privacy policy page (or put it on the front) and configure in the Google Cloud oauth
    * create a terms of service page (or put it on the front) and configure in the Google Cloud oauth
