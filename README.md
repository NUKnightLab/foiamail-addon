# foiamail-addon
A Google Workspace add-on to support journalists making FOIA requests


## Onboarding, permissions, access

To work on the project, you will need to have [the Google Scripts project](https://script.google.com/home/projects/1Z0kUz4KJ3sOGYUeSdbG5WBZS57ubBDM_hcmXsIsJCilYGTtYt7Ygf5_1/edit) shared with you, with Editor privileges. Provide your primary Google account to Joe Germuska or another leader on the project, and they will share it with you.

**You may want to create a separate Google account for testing**, to make sure that nothing that the app does inadvertently affects your primary account. This account will also need to have the project shared with it, so that it can install test deployments of the project.

While the app is in testing mode, any account that installs a test deployment also needs to be added to the Google Cloud test users list by Joe Germuska ([APIS & Services > OAuth Consent Screen](https://console.cloud.google.com/auth/audience?project=foiamail-addon)). If this is skipped, you can still deploy the add-on but you'll get an error when you try go through the "Authorize Access" step.

Instructions below also assume that you have `npm` (Node Package Manager) installed, as well as some `git` client. Git examples in the docs will be based on the git command-line tool; if you prefer to use another Git client, you may need to translate.

We use the [`clasp` command line tool](https://developers.google.com/apps-script/guides/clasp) to push code changes to Google App Scripts.

Start by cloning this repository, if you haven't.

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

`clasp clone` pulls the current code from the project, but also sets up a `.clasp.json` file which has some information that is unique to your development filesystem. (For that reason, `.clasp.json` is *gitignored*. 

Theoretically the `clasp clone` into an already `git clone`'d repository doesn't create changes to any other files from the Git repository. If it does, you should probably use `git checkout .` to discard those changes. We may learn more about this as we move further into team development.


## Developing

This is our first time working as a team to develop a Google Workspace add-on. We are working out best practices for collaboration as we go, and we'll try to document all of that here.

### General develoment pattern

GitHub should be treated as the canonical version of project code. While `clasp` allows you to `clasp pull` the current code from `script.google.com`, this should not be used. Use normal git/GitHub features to update your code, merge changes, make branches for your development work and submit pull requests when you have code that is ready to be merged into the `main` branch.

Pushing code to any GitHub branch is independent of pushing it to `script.google.com` for testing. (Maybe there's a way to use Git commit hooks to make it smoother?)

## Testing

Most testing necessarily has to happen in a web browser, using Google Workspace tools (Gmail, Drive, Sheets, Docs). Google's add-on model makes this slightly complicated for team development, but we have a prospective process documented below.

(We should find any available opportunities for locally-executable testing such as unit tests, but that won't cover many cases.) 

### Deploy the add-on for testing

While the add-on is in development, it can't be installed from the public Google Add-ons website. That is, you can't just search for it to install.

Instead, you must install a test deployment from the [Google App Scripts editor for this project](https://script.google.com/home/projects/1Z0kUz4KJ3sOGYUeSdbG5WBZS57ubBDM_hcmXsIsJCilYGTtYt7Ygf5_1/edit). This is a bit complicated, so read on before you go to do it.

It is possible to install any number of deployed versions of the project into the same account, but for now, best practice would be for each active developer to have their own "deployment". 

The very first time, before you even install the add-on in your Google account, issue this command:

```clasp deploy -d <FRIENDLY_DEPLOYMENT_NAME>```

FRIENDLY_DEPLOYMENT_NAME should include your name, initials, or some other identifier distinct to you. Besides the name, your deployment will get a 72-character ID string which you'll need to use repeatedly during development. You may want to set it in an environment variable, or remember how to use your command history. If you forget it, you can run

```clasp deployments```

to remind yourself.

Now go to the [Google Scripts editor for this project](https://script.google.com/home/projects/1Z0kUz4KJ3sOGYUeSdbG5WBZS57ubBDM_hcmXsIsJCilYGTtYt7Ygf5_1/edit)
click the `deploy` button and choose `Test deployments`  Under the "deployments" menu, select the new deployment you've made, then click the "install" button.  You should now see the add-on in the Gmail and Docs sidebars. 

Then, as you make changes:

```clasp push && clasp deploy -i <YOUR_DEPLOYMENT_ID```  

This will update the code associated with your installed test deployment. *If you forget the `clasp deploy`, or if you forget to specify the deployment identifier with `-i`, you won't see the changes you pushed.*    

While the app is in testing mode, in order to grant the add-on permission to access your GMail, etc, your Google Account must be added to the Google Cloud test users list by Joe Germuska ([APIS & Services > OAuth Consent Screen](https://console.cloud.google.com/auth/audience?project=foiamail-addon)). You can still deploy the add-on but you'll get an error when you try go through the "Authorize Access" step.

If you want to make sure that you've deployed what you meant to deploy, you can edit the `.addons.common.name` property in `appsscript.json`. After this (or any change you want to try on the website), run `clasp push && clasp deploy -i ...` Then when you reload a GMail or other page where the add-on is relevant, you should see the name change, or other changes you've made.

### Code organization

Apps Script allows you to have any number of JavaScript files. There is no need to import functions or other symbols from one into another. At the moment, I'm not sure about the order of processing, but since most everything important should be inside function declarations, it probably doesn't matter.

Try to keep Google app-specific functions in the appropriate files (eg `Gmail.js` and `Drive.js` but don't duplicate shared code -- use `Common.js` or we may choose to have more shared code files as things develop.)

### Tips for collaboration

* Don't edit files using the web-based Apps Script editor. It is likely to lead to confusion.

## Longer-term to-dos
* create a foiamail.knightlab.com website
    * create an application privacy policy page (or put it on the front) and configure in the Google Cloud oauth
    * create a terms of service page (or put it on the front) and configure in the Google Cloud oauth
