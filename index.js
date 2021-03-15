const bodyParser = require('body-parser');
const express = require('express');
const { SolidNodeClient } = require('solid-node-client');
const { LoginManager } = require('./app/controllers/login-manager');
const { FileManager } = require('./app/controllers/file-manager');
const { /*httpClient,*/ httpStatus } = require('./app/util/http');
const { setSolidClientForSlackId } = require('./app/util/solid');
const { commandVerify } = require('./app/middlewares/commands');
const { slackClient, slackVerify } = require('./app/middlewares/slack');
const { /*solidClient,*/ solidVerify } = require('./app/middlewares/solid');
const { getInputValueFromSubmission } = require('./app/util/blocks');

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
    setSolidClientForSlackId(userId, solidClient);
    const chatPayload = {
      token,
      channel: userId,
      text: "Congratulations: you have successfully logged into Solid!",
    };
    try {
      await slackClient.axios.post('chat.postMessage', chatPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
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
  const reqBody = req.body;
  const commands = req.commands;
  const subcommand = commands[0];
  switch (subcommand) {
    case 'profile':
      const profileCommandStatus = await FileManager.exec(slackClient, reqBody, subcommand);
      return res.status(profileCommandStatus).send();
    case 'file':
      const fileCommandStatus = await FileManager.exec(slackClient, reqBody, subcommand);
      return res.status(fileCommandStatus).send();
    default:
      return res.end(`Unrecognized subcommand: \`${subcommand}\`. For the complete set of available commands, please type the following command: \`/solid help\``);
  }
});

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
