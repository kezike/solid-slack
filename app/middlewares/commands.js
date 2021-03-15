const { /*httpClient,*/ httpStatus } = require('../util/http');
const { LoginManager } = require('../controllers/login-manager');
const { slackClient } = require('./slack');

// Verify an incoming command
// Note: this is a workaround for restricted subcommands,
// since we do not use distinct endpoints for each subcommand
const commandVerify = async (req, res, next) => {
  const reqBody = req.body;
  const commandText = reqBody.text.trim();
  const helpMessage = `
    Welcome to SolidSlack! The following is the complete catalog of subcommands available to you. Simply invoke the desired command \`COMMAND\` as \`/solid COMMAND\`:
    - \`login\`: TODO
    - \`file\`: TODO
    - \`dir\`: TODO
    - \`help\`: TODO
  `;
  if (commandText === '') {
    return res.status(httpStatus.OK).send(helpMessage);
  }
  // res.send();
  const commands = commandText.split(' ');
  const subcommand = commands[0];
  switch (subcommand) {
    case 'login':
      const loginCommandStatus = await LoginManager.exec(slackClient, reqBody);
      return res.status(loginCommandStatus).send();
      // res.send();
      // return;
    case 'help':
      return res.status(httpStatus.OK).send(helpMessage);
  }
  req.commands = commands;
  return next();
};

module.exports = { commandVerify };
