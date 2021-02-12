const { /*httpClient,*/ httpStatus } = require('../common/http');
const view = require('../assets/file.json');

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
        const payload = { token, trigger_id, view };
        console.log("view:", view);
        console.log("url:", url);
        console.log("trigger_id:", trigger_id);
        console.log("sc token:", slackClient.token);
        console.log("payload:", payload);
        console.log("env token:", token);
        console.log("client.post:", client.post);
        await client.post(url, payload);
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
