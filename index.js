const bodyParser = require('body-parser');
const express = require('express');
const { SolidNodeClient } = require('solid-node-client');
const { LoginManager } = require('./app/controllers/login-manager');
const { FileManager } = require('./app/controllers/file-manager');
const { /*httpClient,*/ httpStatus } = require('./app/util/http');
const { slackIdToSolidClient } = require('./app/data/solid');
const { commandVerify } = require('./app/middlewares/commands');
const { slackClient, slackVerify } = require('./app/middlewares/slack');
const { /*solidClient,*/ solidVerify } = require('./app/middlewares/solid');
const { getInputValueFromSubmission } = require('./app/util/names');

// Main app
const app = express();
const PORT = process.env.PORT || 3000;

// Parse body as json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Slack verification middleware
app.use(slackVerify);

// Handle interactive components, like modals
// TODO: Currently, this does not work well
// with solidVerify middleware, so we have placed
// it before it since we expect to hit this
// endpoint exclusively through the entry point.
// It may be worth fixing that middleware method
// to work with this endpoint.
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

// Command verification middleware
app.use(commandVerify);
// Solid verification middleware
app.use(solidVerify);

// SolidSlack entrypoint
app.post('/', async (req, res) => {    
  /*const reqBody = req.body;
  const commandText = reqBody.text.trim();
  if (commandText === '') {
    res.end('Welcome to SolidSlack! Please include one of the following subcommands in your invocation of /solid: [login | file | dir | help]');
  }
  res.send();
  const commands = commandText.split(' ');*/
  const commands = req.commands;
  const subcommand = commands[0];
  switch (subcommand) {
    /*case 'login':
      LoginManager.exec(slackClient, reqBody);
      res.send();
      return;
    case 'help':
      return;*/
    case 'file':
      // res.send();
      // const subcommand2 = commands[1];
      const fileCommandStatus = await FileManager.exec(slackClient/*, commands*/, reqBody/*, res*/);
      return res.status(fileCommandStatus).send();
    default:
      return res.end(`Unrecognized subcommand: \`${subcommand}\`. For the complete set of available commands, please type the following command: \`/solid help\``);
  }
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
