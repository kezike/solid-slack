const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const { Login } = require("./controllers/login");

// Slack signing secret and access token environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackAccessToken = process.env.SLACK_ACCESS_TOKEN;
if (!slackSigningSecret || !slackAccessToken) {
    throw new Error('A Slack signing secret and access token are required to run this app.');
}
const slackClient = new WebClient(slackAccessToken);

// Main Solid App
const app = require('express')();
app.use(bodyParser.urlencoded({ extended: false }));
app.post('*', (req, res) => {    
    let payload = req.body;
    let commandText = payload.text;
    if (commandText.trim() === "") {
      res.end("Welcome to Solid Slack! Please include one of the following subcommands in your invocation of '/solid': [login | read | write]");
    }
    const subcommand = commandText.split(' ')[0];
    // res.send();
    switch (subcommand) {
      case "login":
        // res.end("You are trying to login to a Solid pod. You will receive a login form momentarily.");
        Login.exec(slackClient, payload);
        return;
      case "read":
        return;
      case "write":
        return;
    }
});
app.listen();
