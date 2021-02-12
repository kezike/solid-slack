const { client as httpClient } = require('./app/common/http');
const controllers = {};

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
          return File.writeFile(slackClient, commands);
        default:
          return res.end(`Sorry, I do not recognize that subCommand: '${subCommand1}'`);
      }
    }

    static readFile(slackClient, commands, req, res) => {
      console.log("Reading file...");
      console.log(`${req}: ${JSON.stringify(req, null, 2)}`);
      /*try {
        await httpClient.post(responseUrl, {
          text: `\`\`\`Read file!\`\`\``
        });
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
      }*/
    }

    static writeFile(slackClient, commands, req, res) => {
      console.log("Writing file...");
      console.log(`${req}: ${JSON.stringify(req, null, 2)}`);
      /*try {
        await httpClient.post(responseUrl, {
          text: `\`\`\`Wrote file!\`\`\``
        });
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
      }*/
    }
}

module.exports = { File };
