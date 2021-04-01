const bodyParser = require('body-parser');
const express = require('express');
const { AccountManager } = require('./app/controllers/account-manager');
const { FileManager } = require('./app/controllers/file-manager');
const { solidLogin } = require('./app/controllers/solid');
const { httpStatus } = require('./app/util/http');
const { commandVerify } = require('./app/middlewares/commands');
const { slackClient, slackVerify } = require('./app/middlewares/slack');
const { solidVerify } = require('./app/middlewares/solid');

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
  const payload = JSON.parse(req.body.payload);
  const type = payload.type;
  console.log('INTERACTION TYPE:', type);
  // if (type === 'block_actions') {
    // console.log('INTERACTION PAYLOAD:', payload);
  // } else if (type === 'view_submission') {
    const callbackId = payload.view.callback_id;
    console.log('INTERACTION CALLBACK ID:', callbackId);
    switch (callbackId) {
      case 'login-manager':
        const loginResponse = await solidLogin(req, res);
        return loginResponse;
      /*case 'profile-viewer':
        return res.status(httpStatus.OK).send();*/
      case 'file-manager':
        console.log('ACTION PAYLOAD:', payload);
        const url = payload.actions[0].value;
        const contentResponse = FileManager.loadContent(req, res, url);
        return contentResponse;
      default:
        return res.status(httpStatus.OK).send(`Unrecognized interactive component \`callback_id\`: \`${callbackId}\``);
    }
  // }
});

// Command verification middleware
app.use(commandVerify);
// Solid verification middleware
app.use(solidVerify);

// SolidSlack entrypoint
app.post('/', async (req, res) => {    
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
    default:
      return res.send(`Unrecognized command: \`${command}\`. For the complete set of available commands, please type the following command: \`/solid help\``);
  }
});

app.listen(PORT, () => console.log(`Solid Slack listening at http://0.0.0.0:${PORT}`));
