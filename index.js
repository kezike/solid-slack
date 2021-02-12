// const HttpStatus = require('http-status-codes');
const bodyParser = require('body-parser');
const express = require('express');
// const axios = require('axios').default;
// const solidAuth = require('solid-auth-cli');
const { SolidNodeClient } = require('solid-node-client');
const { Login } = require('./app/controllers/login');
const { File } = require('./app/controllers/file');
const { /*httpClient,*/ httpStatus } = require('./app/common/http');
const { slackClient, slackVerify } = require('./app/auth/slack');
const { solidClient, solidLogin } = require('./app/auth/solid');

// Main Solid App
const app = express();
const PORT = process.env.PORT || 3000;

// Parse body like json
app.use(bodyParser.urlencoded({ extended: false }));
// Slack verification middleware
app.use(slackVerify);
// Solid login middleware
// app.use(solidLogin);

// SolidSlack Entrypoint
app.post('/', async (req, res) => {    
    let payload = req.body;
    let commandText = payload.text;
    if (commandText.trim() === '') {
      res.end('Welcome to SolidSlack! Please include one of the following subCommands in your invocation of /solid: [login | read | write]');
    }
    res.send();
    const commands = commandText.split(' ');
    const subCommand1 = commands[0];
    console.log("commands:", commands);
    console.log("subCommand1:", subCommand1);
    switch (subCommand1) {
      case 'file':
        // res.send();
        // const subCommand2 = commands[1];
        const fileCommandStatus = await File.exec(slackClient/*, commands*/, req/*, res*/);
        return res.status(fileCommandStatus).send();
      case 'login':
        Login.exec(slackClient, payload);
        res.send();
        return;
      case 'read':
        return;
      case 'write':
        return;
      default:
        return res.end(`Sorry, I do not recognize that subCommand: '${subCommand1}'`);
    }
});

app.post('/interactive', async (req, res) => {
    res.send();
});

/*app.post('/login', async (req, res) => {
    const payload = JSON.parse(req.body.payload);
    const submission = payload.submission;
    const channel = payload.channel;
    const responseUrl = payload.response_url;
    const httpClient = slackClient.axios;
    const { solid_account, solid_uname, solid_pass } = submission;
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
        await httpClient.post(responseUrl, {
          text: `\`\`\`${dataText}\`\`\``
        });
      } catch (e) {
        console.error(JSON.stringify(e, null, 4));
      }
    }
    return res.status(httpStatus.OK).send();
});*/

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
