const { FileManager } = require('../app/controllers/file-manager');

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
    default:
      return res.send(`Unrecognized command: \`${command}\`. For the complete set of available commands, please type the following command: \`/solid help\``);
  }
};

module.exports = entryHandler;
