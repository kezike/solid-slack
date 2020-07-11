const HttpStatus = require('http-status-codes');
const bodyParser = require('body-parser');
const express = require('express');
const solidAuth = require('solid-auth-cli');
const { WebClient } = require('@slack/client');
const { Login } = require('./app/controllers/login');
const { verifySignature } = require('./app/signature');

// Slack signing secret and access token environment variables
const slackAccessToken = process.env.SLACK_ACCESS_TOKEN;
const slackClient = new WebClient(slackAccessToken);

// Main Solid App
const app = express();
const PORT = process.env.PORT || 3000;

// Parse body like json
app.use(bodyParser.urlencoded({ extended: false }));
// Signature verification middleware
app.use(verifySignature);

// SolidSlack Entrypoint
app.post('/', (req, res) => {    
    console.log('Processing /solid request...');
    let payload = req.body;
    let commandText = payload.text;
    if (commandText.trim() === '') {
      res.end('Welcome to Solid Slack! Please include one of the following subcommands in your invocation of /solid: [login | read | write]');
    }
    const subcommand = commandText.split(' ')[0];
    switch (subcommand) {
      case 'login':
        console.log('Opening login dialog...');
        Login.exec(slackClient, payload);
        console.log('Login complete!');
        return;
      case 'read':
        return;
      case 'write':
        return;
      default:
        res.end(`Sorry, I do not recognize that subcommand: '${subcommand}'`);
        return;
    }
});

app.post('/login', async (req, res) => {
    const payload = JSON.parse(req.body.payload);
    const submission = payload.submission;
    const {solid_account, solid_uname, solid_pass} = submission;
    console.log(`payload: ${payload}`);
    console.log(`Object.keys(payload): ${Object.keys(payload)}`);
    console.log(`submission: ${submission}`);
    console.log(`solid_account: ${solid_account}`);
    console.log(`solid_uname: REDACTED(${solid_uname.length})`);
    console.log(`solid_pass: REDACTED(${solid_pass.length})`);
    const session = await solidAuth.login({idp: solid_account, username: solid_uname, password: solid_pass});
    const data = await solidAuth.fetch("https://kezike.solid.community/inbox/4abfac60-24ca-11e9-8100-c3978cab0676.txt");
    const dataText = await data.text();
    res.end(dataText);
});

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
