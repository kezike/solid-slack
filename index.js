const HttpStatus = require('http-status-codes');
const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios').default;
// const solidAuth = require('solid-auth-cli');
const { SolidNodeClient } = require('solid-node-client');
const { WebClient } = require('@slack/client');
const { Login } = require('./app/controllers/login');
const { verifySignature } = require('./app/signature');

// Solid variables
const solidClient = new SolidNodeClient();

// Slack variables
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
    let payload = req.body;
    let commandText = payload.text;
    if (commandText.trim() === '') {
      res.end('Welcome to Solid Slack! Please include one of the following subcommands in your invocation of /solid: [login | read | write]');
    }
    const subcommand = commandText.split(' ')[0];
    switch (subcommand) {
      case 'login':
        Login.exec(slackClient, payload);
        res.send();
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
    const channel = payload.channel;
    const responseUrl = payload.response_url;
    const {solid_account, solid_uname, solid_pass} = submission;
    const loginOptions = {
      idp: solid_account,
      username: solid_uname,
      password: solid_pass
    };
    const session = await solidClient.login(loginOptions);
    if (session) {
      const data = await solidClient.fetch("https://kezike.solidcommunity.net/inbox/4abfac60-24ca-11e9-8100-c3978cab0676.txt");
      const dataText = await data.text();
      try {
        await axios.post(responseUrl, {
          text: `\`\`\`${dataText}\`\`\``;
        });
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
      }
    }
    return res.status(HttpStatus.OK).send();
});

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
