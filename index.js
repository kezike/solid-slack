const bodyParser = require('body-parser');
const express = require('express');
const { SolidNodeClient } = require('solid-node-client');
const { LoginManager } = require('./app/controllers/login-manager');
const { FileManager } = require('./app/controllers/file-manager');
const { /*httpClient,*/ httpStatus } = require('./app/util/http');
const { slackIdToSolidClient } = require('./app/auth/common');
const { slackClient, slackVerify } = require('./app/auth/slack');
const { /*solidClient,*/ solidVerify } = require('./app/auth/solid');
const { getInputValueFromSubmission } = require('./app/util/names');

// Main Solid App
const app = express();
const PORT = process.env.PORT || 3000;

// Parse body like json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Slack verification middleware
app.use(slackVerify);
// Solid login middleware
app.use(solidVerify);

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
  res.send();
  const submission = JSON.parse(req.body.payload);
  const userId = submission.user.id;
  const callbackId = submission.callback_id
  /*switch (callbackId) {
    case 'login-manager':
      ;
    default:
      ;
  }*/
  const solid_account = getInputValueFromSubmission(submission, 'solid_account');
  const solid_uname = getInputValueFromSubmission(submission, 'solid_uname');
  const solid_pass = getInputValueFromSubmission(submission, 'solid_pass');
  const loginOptions = {
    idp: solid_account,
    username: solid_uname,
    password: solid_pass,
  };
  const solidClient = new SolidNodeClient();
  const session = await solidClient.login(loginOptions);
  const token = slackClient.token;
  if (session) {
    slackIdToSolidClient[userId] = solidClient;
    const chatPayload = {
      token,
      channel: userId,
      text: "Congratulations: you have successfully logged into Solid!",
    };
    try {
      await slackClient.axios.post('chat.postMessage', chatPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
      return res.status(httpStatus.BAD_REQUEST).json(e);
    }
  }
  return res.status(httpStatus.UNAUTHORIZED).send('Solid login failed');
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
  return res.status(httpStatus.UNAUTHORIZED).send('Solid login failed');
});*/

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
