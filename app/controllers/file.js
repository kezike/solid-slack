const { /*httpClient, */httpStatus } = require('../common/http');
const view = JSON.stringify(require('../assets/file.json'), null, 4);

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
    static async exec(slackClient/*, commands*/, req/*, res*/) {
      /*const subCommand1 = commands[1];
      switch (subCommand1) {
        case 'read':
          const readCommandStatus = await File.readFile(slackClient, commands, req, res);
          return readCommandStatus;
        case 'write':
          const writeCommandStatus = await File.writeFile(slackClient, commands, req, res);
          return writeCommandStatus;
        default:
          return res.end(`Sorry, I do not recognize that subCommand: '${subCommand1}'`);
      }*/

      try {
        const token = slackClient.token;
        const { trigger_id } = req.body;
        const url = `${slackClient.slackApiUrl}views.open`;
        const client = slackClient.axios;
        const payload = { /*token, */trigger_id, view };
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        // console.log("view.blocks[2].accessory:", JSON.stringify(view.blocks[2].accessory, null, 4));
        // console.log("view.blocks[3].elements:", JSON.stringify(view.blocks[3].elements, null, 4));
        console.log("URL:", url);
        await client.post(url/*'views.open'*/, payload, headers);
        // await httpClient.post(url, payload);
        return httpStatus.OK;
      } catch (e) {
        console.error(JSON.stringify(e, null, 4));
        return httpStatus.BAD_REQUEST;
      }
    }

    /*static async readFile(slackClient, commands, req, res) {
      console.log("Reading file...");
    }

    static async writeFile(slackClient, commands, req, res) {
      console.log("Writing file...");
    }*/
}

module.exports = { File };
