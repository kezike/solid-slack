const bodyParser = require('body-parser');
const express = require('express');
const { SolidNodeClient } = require('solid-node-client');
const { LoginManager } = require('./app/controllers/login-manager');
const { FileManager } = require('./app/controllers/file-manager');
const { /*httpClient,*/ httpStatus } = require('./app/common/http');
const { slackClient, slackVerify } = require('./app/auth/slack');
const { /*solidClient,*/ solidLogin } = require('./app/auth/solid');

// Main Solid App
const app = express();
const PORT = process.env.PORT || 3000;

// Parse body like json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Slack verification middleware
app.use(slackVerify);
// Solid login middleware
// app.use(solidLogin);

// SolidSlack Entrypoint
app.post('/', async (req, res) => {    
  let payload = req.body;
  let commandText = payload.text;
  if (commandText.trim() === '') {
    res.end('Welcome to SolidSlack! Please include one of the following subCommands in your invocation of /solid: [login | file | dir]');
  }
  res.send();
  const commands = commandText.split(' ');
  const subCommand1 = commands[0];
  switch (subCommand1) {
    case 'file':
      // res.send();
      // const subCommand2 = commands[1];
      const fileCommandStatus = await FileManager.exec(slackClient/*, commands*/, req.body/*, res*/);
      return res.status(fileCommandStatus).send();
    case 'login':
      LoginManager.exec(slackClient, payload);
      res.send();
      return;
    case 'help':
      return;
    default:
      return res.end(`Sorry, I do not recognize that subCommand: '${subCommand1}'`);
  }
});

app.post('/interactive', async (req, res) => {
  console.log("just hit interactive endpoint...");
  res.send();
  const payload = JSON.parse(req.body.payload);
  console.log("interactive req.body:", req.body);
  console.log("interactive payload:", payload);
  const blocks = payload.blocks;
  console.log("BLOCKS:", JSON.stringify(blocks, null, 4));
  const submission = payload.submission;
  const callbackId = payload.callback_id
  const responseUrl = payload.response_url;
  /*switch (callbackId) {
    case 'login-manager':
      ;
    default:
      ;
  }*/
  const { solid_account, solid_uname, solid_pass } = submission;
  const loginOptions = {
    idp: solid_account,
    username: solid_uname,
    password: solid_pass,
  };
  const solidClient = new SolidNodeClient();
  const session = await solidClient.login(loginOptions);
  if (session) {
    const slackUserId = req.body.user_id;
    slackIdToSolidClient[slackUserId] = solidClient;
    try {
      await slackClient.axios.post(responseUrl, {
        text: "```Congratulations: you have successfully logged into Solid!```"
      });
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
    }
    return res.status(httpStatus.OK).send();
  }
  return res.status(HttpStatus.UNAUTHORIZED).send('Solid login failed');
});

/*app.post('/login', async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  const submission = payload.submission;
  const responseUrl = payload.response_url;
  const { solid_account, solid_uname, solid_pass } = submission;
  const loginOptions = {
    idp: solid_account,
    username: solid_uname,
    password: solid_pass,
  };
  const session = await solidClient.login(loginOptions);
  if (session) {
    solidClient = new SolidNodeClient();
    const slackUserId = req.body.user_id;
    slackIdToSolidClient[slackUserId] = solidClient;
    try {
      await slackClient.axios.post(responseUrl, {
        text: `\`\`\`${dataText}\`\`\``
      });
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
    }
    return res.status(httpStatus.OK).send();
  }
  return res.status(HttpStatus.UNAUTHORIZED).send('Solid login failed');
});*/

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
