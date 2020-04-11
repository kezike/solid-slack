const HttpStatus = require('http-status-codes');
const bodyParser = require('body-parser');
const express = require('express');
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
    // res.status(HttpStatus.OK).json({text: 'ok, got it'});
    switch (subcommand) {
      case 'login':
        console.log('Opening login dialog...');
        Login.exec(slackClient, payload);
        console.log('Login complete!');
        // res.status(200).send('You are attempting to login to Solid. The login form will be presented momentarily...');
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

app.post('/login', (req, res) => {
    const payload = req.body.payload;
    console.log(`payload:\n${payload}`);
    console.log(`payloadStr:\n${JSON.stringify(payload)}`);
    // res.status(HttpStatus.OK).json({text: 'You have accessed the Solid Slack login dialog service.'});
    res.send();
});

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
