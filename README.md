# solid-slack
This package contains a [Slack Integration](https://api.slack.com/internal-integrations) for accessing and managing data stored in [Solid](https://inrupt.com/solid), a Web-based personal data management platform.
<img src="https://github.com/kezike/public-data/blob/main/solid-slack/profile.gif?raw=true" alt="view profile" width=600>

## Requirements
### Hosting `solid-slack`
At the moment, there are no hosted options for `solid-slack`, so you will have to provide your own.

There are a number of free options for hosting a web app. As the developer, I have experimented with `Heroku` and `Vercel/now.sh`. While I have had tremendous success with the former, I encountered non-trivial challenges with the latter and have concluded that it is not compatible with the deployment model of `solid-slack`. That said, I encourage folks to use the platform that they are most comfortable with.

Once you have chosen your hosting platform of preference, deploy this code to that platform. [Here are instructions](https://www.geeksforgeeks.org/how-to-deploy-node-js-app-on-heroku-from-github) for setting up automated deployments between GitHub and Heroku. Note: if you use the Heroku option, only follow from step 4 onward and take note of the application URL that is generated at the end (e.g., https://my-solid-slack.herokuapp.com). You will have to come back to this platform after the `Configuring Slack` below to set the `SLACK_ACCESS_TOKEN` and `SLACK_SIGNING_SECRET` environment variables.

### Configuring Slack
OK, let's `slack` for a bit :sunglasses: Here is some important Slack bookkeeping that you must do before you can use `solid-slack`:
1. Create a Slack account [here](https://slack.com/signin#/signin) if you don't have one already.
2. Create a Slack app [here](https://api.slack.com/apps?new_app=1).
3. In the app view, follow some of the instructions under the `Add features and functionality` section within the `Building Apps for Slack` block:
  - Create a slash command under `Slash Commands`: Fill out the form for generating a slash command and add it to your app. Be sure to use the URL that was generated in the `Hosting solid-slack` section above with the `entry` endpoint as the `Request URL` (e.g., https://my-solid-slack.herokuapp.com/entry).
  - Enable useful actions in your app under `Interactivity & Shortcuts`: Be sure to use the URL that was generated in the `Hosting solid-slack` section above with the `action` endpoint as the `Request URL` (e.g., https://my-solid-slack.herokuapp.com/action).
  - Enable appropriate application scopes under `OAuth & Permissions`: Be sure to select the following `Bot Token Scopes`:
    - `commands`
    - `channels:read`
    - `chat:write`
    - `im:write`
    - `links:write`
  - [Optional] Configure DM with Solid bot under `App Home`: Under the `Show Tabs` block, enable `Messages Tab` and select `Allow users to send Slash commands and messages from the messages tab`.
4. In the app view, install your app under the `Install your app` section within the `Building Apps for Slack` block. This should generate the necessary OAuth tokens for your workspace and enable you to use `solid-slack`.
5. Return to the platform configured in the `Hosting solid-slack` section above and set the following environment variables:
  - `SLACK_ACCESS_TOKEN`: use the value that was generated under `Bot User OAuth Token` in the `OAuth Tokens for Your Workspace` block of the `OAuth & Permissions` section
  - `SLACK_SIGNING_SECRET`: use the value that was generated under `Signing Secret` in the `App Credentials` block

### Configuring Solid
But wait ... you gotta be `solid` before you can `slack` ... :sweat_smile: Here is some important Solid bookkeeping that you must do before you can use `solid-slack`:
1. In order for you to use `solid-slack`, you must have an account with a Solid compliant identity provider. There are many free community options available out there, including [this early and popular one](https://solidcommunity.net) and [this one provided by Inrupt](https://inrupt.net), a major gravitational force in the Solid ecosystem today.
2. If you intend to access private data in your pod (e.g., inbox messages), you must add https://solid-node-client as a trusted app on the pod. This enables `solid-slack` to use [`solid-node-client`](https://github.com/solid/solid-node-client), an npm module that enables read and write access to your pod. In order to make the appropriate permission updates to your pod, follow [these instructions](https://github.com/solid/userguide#manage-your-trusted-applications).

## Commands
### Login
Login to your Solid pod with `/solid login`
<img src="https://github.com/kezike/public-data/blob/main/solid-slack/login.gif?raw=true" alt="login" width=600>

### View Profile
View your Solid profile page with `/solid profile`
<img src="https://github.com/kezike/public-data/blob/main/solid-slack/profile.gif?raw=true" alt="view profile" width=600>

### Explore Account Data
Navigate through the data in your Solid account with `/solid account`
<img src="https://github.com/kezike/public-data/blob/main/solid-slack/account.gif?raw=true" alt="explore account" width=600>

### Edit Account Data
Edit the data in your Solid account while in account view
<img src="https://github.com/kezike/public-data/blob/main/solid-slack/edit.gif?raw=true" alt="explore account" width=600>

## Developer Notes
### Disclaimers
- While `solid-slack` does not expose Solid authentication key material with Slack, it does submit your plaintext data to the Slack API in order to display your data to you in the view presented with the `/solid account` command. This is only as acceptable as the extent to which you trust Slack. Keep this in mind as you navigate your data in `solid-slack`.
- Remember that you are storing `SLACK_ACCESS_TOKEN` and `SLACK_SIGNING_SECRET` on a platform that is hosting your deployment of `solid-slack` (configured in the `Hosting solid-slack` section above). Make sure that you trust that platform. You have complete control over your choice of this platform, as it could be a VPS, a local server, or even a Raspberry Pi.

### Limitations
- The Slack API does not allow apps to push more than `3` views to the presentation stack. To make this clear to users, there is a visual aid advising users to continue data navigation in the browser where relevant. This limitation is represented in the code with the `VIEW_STACK_LIMIT` constant.
- The Slack API does not allow apps to present views that are greater than `3000` characters in length. To make this clear to users, there is a visual aid advising users to view data in the browser where relevant. This limitation is represented in the code with the `FILE_SIZE_LIMIT` constant.
- The Slack API does not allow apps to present views without content. To make this clear to users, there is a visual aid informing users that the file is empty while also fulfilling this size requirement for view presentation.

### Next Steps
- Enable content creation
- Enable content deletion
- Enable content sharing
- Develop a stronger security model that avoids sharing plaintext data with Slack
- Deploy `solid-slack` to production

### Contribute
If any of this is interesting to you, please reach me [here](mailto:kezike13@gmail.com) to get involved!
