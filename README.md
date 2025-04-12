# foiamail-addon
A Google Workspace add-on to support journalists making FOIA requests


## Onboarding, permissions, access

To work on the project, you will need to have [the Google Scripts project](https://script.google.com/home/projects/1Z0kUz4KJ3sOGYUeSdbG5WBZS57ubBDM_hcmXsIsJCilYGTtYt7Ygf5_1/edit) shared with you, with Editor privileges. **You may want to create a separate Google account for testing**, to make sure that nothing that the app does inadvertently affects your primary account. 

Provide your Google account to Joe Germuska or another leader on the project, and they will share the Google Scripts project with you. **Note**: You must use a regular Google account, not a `u.northwestern.edu` account.

While the app is in testing mode, any account that installs a test deployment also needs to be added to the Google Cloud test users list by Joe Germuska ([APIS & Services > OAuth Consent Screen](https://console.cloud.google.com/auth/audience?project=foiamail-addon)). If this is skipped, you can still deploy the add-on but you'll get an error when you try go through the "Authorize Access" step.

Once the project has been shared with you, you will also need to enable the Apps Script API. Enable it by visiting https://script.google.com/home/usersettings Under "Settings", click on "Google Apps Script API", and on the next page, click the toggle next to "enable" so that it is blue, not gray.

### Using the terminal
Working on this project involves several command-line tools. You can run these in a terminal on your computer, or in a terminal emulator in your IDE (like VSCode). If you don't know how to do this, ask for help.

### Installing Node
You must install Node.js, the JavaScript runtime, in order to use the `clasp` command line tool. If you haven't installed it before, follow the instructions here: https://nodejs.org/en/download

### Installing Git
You must install `git`. If you haven't installed it before, follow the instructions here: https://git-scm.com/downloads — we strongly encourage installing the command line version, but if you prefer a GUI, you can use that too. 

When you have `git` installed, clone the repository that contains this README file, if you haven't already.

### Install clasp
We use [`clasp`](https://developers.google.com/apps-script/guides/clasp) to push code changes to Google App Scripts.

`clasp` is a command line tool that helps us ensure consistency when making changes to the Apps Script project. 

Run the following commands to install `clasp` and log in to your Google account

```bash
npm install @google/clasp -g
clasp login
```

Then, in the git repo directory, `clasp clone` the project using the correct script ID.
```bash
clasp clone 1Z0kUz4KJ3sOGYUeSdbG5WBZS57ubBDM_hcmXsIsJCilYGTtYt7Ygf5_1
```

`clasp clone` pulls the current code from the project, but also sets up a `.clasp.json` file which has some information that is unique to your development filesystem. (For that reason, `.clasp.json` is *gitignored*. 

Theoretically the `clasp clone` into an already `git clone`'d repository doesn't create changes to any other files from the Git repository. If it does, you should probably use `git checkout .` to discard those changes. We may learn more about this as we move further into team development.


## Developing

This is our first time working as a team to develop a Google Workspace add-on. We are working out best practices for collaboration as we go, and we'll try to document all of that here.

### General develoment pattern

GitHub should be treated as the canonical version of project code. While `clasp` allows you to `clasp pull` the current code from `script.google.com`, this should not be used. Use normal git/GitHub features to update your code, merge changes, make branches for your development work and submit pull requests when you have code that is ready to be merged into the `main` branch.

Pushing code to any GitHub branch is independent of pushing it to `script.google.com` for testing. You will use `clasp deploy` to push code to the Google App Scripts project. Note that you can deploy code with clasp that hasn't been pushed to the GitHub repository. This is fine for testing, but you should not do this for code that is on the path to public deployment.

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

```clasp push && clasp deploy -d <FRIENDLY_DEPLOYMENT_NAME> -i <YOUR_DEPLOYMENT_ID>```  

This will update the code associated with your installed test deployment. *If you forget the `clasp push` or the `clasp deploy`, or if you forget to specify the deployment identifier with `-i`, you won't see the changes you pushed.*    

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
