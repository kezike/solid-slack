const { httpClient, httpStatus } = require('../common/http');

/**
 * @class File
 */
class File {
    /**
     * @static
     * @param {*} slackClient
     * @param {*} commands (e.g., [file, read, filename])
     * @param {*} req
     * @param {*} res
     * @memberof File
     */
    static async exec(slackClient, commands, req, res) {
      const subCommand1 = commands[1];
      switch (subCommand1) {
        case 'read':
          const readCommandStatus = await File.readFile(slackClient, commands, req, res);
          return readCommandStatus;
        case 'write':
          const writeCommandStatus = await File.writeFile(slackClient, commands, req, res);
          return writeCommandStatus;
        default:
          return res.end(`Sorry, I do not recognize that subCommand: '${subCommand1}'`);
      }
    }

    static async readFile(slackClient, commands, req, res) {
      console.log("Reading file...");
      console.log("req.body:", JSON.stringify(req.body, null, 2));
      const responseUrl = req.body.response_url;
      try {
        await httpClient.post(responseUrl, {
          text: `\`\`\`Read file!\`\`\``
        });
        return httpStatus.OK;
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
      }
    }

    static async writeFile(slackClient, commands, req, res) {
      console.log("Writing file...");
      console.log("req.body:", JSON.stringify(req.body, null, 2));
      const responseUrl = req.body.response_url;
      try {
        await httpClient.post(responseUrl, {
          text: `\`\`\`Wrote file!\`\`\``
        });
        return httpStatus.OK;
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
      }
    }
}

module.exports = { File };
