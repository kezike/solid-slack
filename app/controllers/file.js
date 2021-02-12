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
    static exec(slackClient, commands, req, res) {
      const subCommand1 = commands[1];
      switch (subCommand1) {
        case 'read':
          return File.readFile(slackClient, commands, req, res);
        case 'write':
          return File.writeFile(slackClient, commands, req, res);
        default:
          return res.end(`Sorry, I do not recognize that subCommand: '${subCommand1}'`);
      }
    }

    async static readFile(slackClient, commands, req, res) {
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

    async static writeFile(slackClient, commands, req, res) {
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
