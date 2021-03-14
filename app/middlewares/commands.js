const { LoginManager } = require('../controllers/login-manager');
const { slackClient } = require('./slack');

// Verify an incoming command
// Note: this is a workaround for restricted subcommands,
// since we do not use distinct endpoints for each subcommand
const commandVerify = async (req, res, next) => {
  const reqBody = req.body;
  const commandText = reqBody.text.trim();
  if (commandText === '') {
    return res.send('Welcome to SolidSlack! Please include one of the following subcommands in your invocation of /solid: [login | file | dir | help]');
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
      return;
  }
  req.commands = commands;
  return next();
};

module.exports = { commandVerify };
