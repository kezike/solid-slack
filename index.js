const bodyParser = require('body-parser');
const express = require('express');
const { AccountManager } = require('./app/controllers/account-manager');
const { FileManager } = require('./app/controllers/file-manager');
const { solidLogin, solidLogout } = require('./app/controllers/solid');
const { httpStatus } = require('./app/util/http');
const { commandVerify } = require('./app/middlewares/commands');
const { slackVerify } = require('./app/middlewares/slack');
const { solidVerify } = require('./app/middlewares/solid');

// Main app
const app = express();
const PORT = process.env.PORT || 3000;

// Handle app entrypoint
const entryHandler = async (req, res) => {    
  const commands = req.commands;
  const command = commands[0];
  switch (command) {
    case 'profile':
      const profileResponse = await FileManager.exec(req, res, command);
      return profileResponse;
    case 'account':
      const accountResponse = await FileManager.exec(req, res, command);
      return accountResponse;
    case 'file':
      const fileResponse = await FileManager.exec(req, res, command);
      return fileResponse;
    case 'logout':
      const logoutResponse = await solidLogout(req, res);
      return logoutResponse;
    default:
      return res.send(`Sorry, I don't recognize your command: \`${command}\`. For the complete set of available commands, please type the following command: \`/solid help\``);
  }
};

// Handle interactive components, like modal buttons
const actionHandler = async (req, res) => {
  // this is a necessary acknowledgment response
  // for most interactions in Slack apps
  res.status(httpStatus.OK).send();
  const payload = JSON.parse(req.body.payload);
  const type = payload.type;
  const callbackId = payload.view.callback_id;
  let command;
  switch (callbackId) {
    case 'login-manager':
      const loginResponse = await solidLogin(req, res);
      return loginResponse;
    case 'file-manager':
      command = payload.actions[0].action_id;
      const contentResponse = await FileManager.exec(req, res, command);
      return contentResponse;
    case 'save-content':
      command = callbackId;
      const saveResponse = await FileManager.exec(req, res, command);
      return saveResponse;
    default:
      return res.status(httpStatus.OK).send(`Unrecognized interactive component \`callback_id\`: \`${callbackId}\``);
  }
};

// Parse body as json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Slack verification middleware
app.use(slackVerify);

// TODO: Currently, this does not work well
// with solidVerify middleware, so we have placed
// it before it since we expect to hit this
// endpoint exclusively through the entry point.
// It may be worth fixing that middleware method
// to work with this endpoint.
app.post('/action', actionHandler);

// Command verification middleware
app.use(commandVerify);
// Solid verification middleware
app.use(solidVerify);

// SolidSlack entrypoint
app.post('/entry', entryHandler);

app.listen(PORT, () => console.log(`Solid Slack is listening at http://0.0.0.0:${PORT}`));
