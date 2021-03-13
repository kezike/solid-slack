const { httpStatus } = require('../common/http');
const viewFile = require('../assets/file.json');

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
      case 'create':
        const createCommandStatus = await File.createFile(slackClient, req);
        return createCommandStatus;
      case 'review':
        const reviewCommandStatus = await File.reviewFile(slackClient, req);
        return reviewCommandStatus;
      case 'edit':
        const editCommandStatus = await File.editFile(slackClient, req);
        return editCommandStatus;
      case 'delete':
        const deleteCommandStatus = await File.deleteFile(slackClient, req);
        return deleteCommandStatus;
      default:
        return httpStatus.BAD_REQUEST;
    }*/

    try {
      const { trigger_id } = req.body;
      const token = slackClient.token;
      const view = JSON.stringify(viewFile, null, 4);
      const client = slackClient.axios;
      const payload = { token, trigger_id, view };
      const res = await client.post('views.open', payload);
      return httpStatus.OK;
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
      return httpStatus.BAD_REQUEST;
    }
  }

  static async createFile(slackClient/*, commands*/, req/*, res*/) {
    console.log("Creating file...");
  }

  static async reviewFile(slackClient/*, commands*/, req/*, res*/) {
    console.log("Reviewing file...");
  }

  static async editFile(slackClient/*, commands*/, req/*, res*/) {
    console.log("Editing file...");
  }

  static async deleteFile(slackClient/*, commands*/, req/*, res*/) {
    console.log("Deleting file...");
  }
}

module.exports = { File };
