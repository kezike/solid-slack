const HttpStatus = require('http-status-codes');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const { Login } = require("./app/controllers/login");
const { verifySignature } = require("./app/signature");

// Slack signing secret and access token environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackAccessToken = process.env.SLACK_ACCESS_TOKEN;
/*if (!slackSigningSecret || !slackAccessToken) {
    throw new Error('A Slack signing secret and access token are required to run this app.');
}*/
const slackClient = new WebClient(slackAccessToken);

// Main Solid App
const app = require('express')();
const PORT = 3000;
// Parse body like json
app.use(bodyParser.urlencoded({ extended: false }));
// Signature verification middleware
app.use(verifySignature);
// SolidSlack Entrypoint
app.post('/', (req, res) => {    
    let payload = req.body;
    let commandText = payload.text;
    if (commandText.trim() === "") {
      res.end("Welcome to Solid Slack! Please include one of the following subcommands in your invocation of '/solid': [login | read | write]");
    }
    const subcommand = commandText.split(' ')[0];
    // res.status(HttpStatus.OK).json({text: 'ok, got it'});
    switch (subcommand) {
      case "login":
        res.status(200).send("You are attempting to login to Solid. The login form will be presented momentarily...");
        Login.exec(slackClient, payload);
        return;
      case "read":
        return;
      case "write":
        return;
      default:
        res.end(`Sorry, I do not recognize that subcommand: "${subcommand}"`);
        return;
    }
});

app.post('/login', (req, res) => {
    // let payload = req.body.payload;
    res.status(HttpStatus.OK).json({text: "You have accessed the Solid Slack login dialog service."});
});

app.listen(PORT, () => console.log(`Solid Slack listening at http://localhost:${PORT}`));
