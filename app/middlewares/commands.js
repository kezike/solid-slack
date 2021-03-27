const { httpStatus } = require('../util/http');
const { AccountManager } = require('../controllers/account-manager');
const { slackClient } = require('./slack');

// Verify an incoming command
// Note: this is a workaround for unrestricted commands,
// since we do not use distinct endpoints for each command
// and the entrypoint is protected by the solidVerify middleware
const commandVerify = async (req, res, next) => {
  const reqBody = req.body;
  const commandText = reqBody.text.trim();
  const helpMessage = `
    Hello, I am Solid Bot :wave::skin-tone-4: How can I help you today? (P.S.: I only speak Solid, so please address me as \`/solid COMMAND\`):
    - \`login\`: login to your Solid pod
    - \`logout\`: logout of your Solid pod
    - \`profile\`: fetch your Solid profile
    - \`file\`: TODO
    - \`dir\`: TODO
    - \`help\`: TODO
  `;
  if (commandText === '') {
    return res.status(httpStatus.OK).send(helpMessage);
  }
  res.send();
  const commands = commandText.split(' ');
  const command = commands[0];
  switch (command) {
    case 'login':
      const loginResponse = await AccountManager.exec(req, res, command);
      return loginResponse;
    case 'help':
      return res.status(httpStatus.OK).send(helpMessage);
  }
  req.commands = commands;
  return next();
};

module.exports = { commandVerify };
