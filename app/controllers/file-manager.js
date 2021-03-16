const { getBlockById, setBlockFieldValue } = require('../util/blocks');
const { getSolidClientFromSlackId } = require('../util/solid');
const { slackClient } = require('../middlewares/slack');
const { httpStatus } = require('../util/http');
const fileManager = require('../assets/file-manager-home');
const fileViewer = require('../assets/file-viewer');

/**
 * @class FileManager
 */
class FileManager {
  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} command
   * @memberof FileManager
   */
  // static async exec(slackClient, reqBody, command) {
  static async exec(req, res, command) {
    switch (command) {
      case 'profile':
        // const profileCommandStatus = await FileManager.loadProfile(slackClient, reqBody);
        // return profileCommandStatus;
        const profileResponse = await FileManager.loadProfile(req, res);
        return profileResponse;
      case 'create':
        const createCommandStatus = await FileManager.createFile(slackClient, reqBody);
        return createCommandStatus;
      case 'review':
        const reviewCommandStatus = await FileManager.reviewFile(slackClient, reqBody);
        return reviewCommandStatus;
      case 'edit':
        const editCommandStatus = await FileManager.editFile(slackClient, reqBody);
        return editCommandStatus;
      case 'delete':
        const deleteCommandStatus = await FileManager.deleteFile(slackClient, reqBody);
        return deleteCommandStatus;
      case 'share':
        const shareCommandStatus = await FileManager.shareFile(slackClient, reqBody);
        return shareCommandStatus;
      default:
        return httpStatus.BAD_REQUEST;
    }

    /*try {
      const { trigger_id } = reqBody;
      const token = slackClient.token;
      const view = JSON.stringify(fileManager, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return httpStatus.OK;
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return httpStatus.BAD_REQUEST;
    }*/
  }

  static async loadProfile(req, res) {
    try {
      console.log('Loading profile...');
      const { trigger_id } = req.body;
      const token = slackClient.token;
      const userId = req.body.user_id;
      console('Retrieving block id...');
      const block = getBlockById(fileViewer, 'file_viewer');
      console.log('Successfully retrieved block id!');
      const solidClient = getSolidClientFromSlackId(userId);
      const profilePromise = await solidClient.fetch(webId);
      const profile = await profilePromise.text();
      console.log('Successfully retrieved profile!');
      console.log('Setting view block to profile...');
      setBlockFieldValue(block, ['text', 'text'], profile);
      console.log('Sucessfully set view block to profile!');
      const view = JSON.stringify(fileViewer, null, 2);
      const viewPayload = { token, trigger_id, view };
      console.log('profilePayload:', viewPayload);
      await slackClient.axios.post('views.open', viewPayload);
      console.log('Successfully loaded profile!');
      res.status(httpStatus.OK).send();
      // return { status: httpStatus.OK, message: '' };
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      res.status(httpStatus.BAD_REQUEST).send();
      // return { status: httpStatus.BAD_REQUEST, message: '' };
    }
  }

  static async createFile(slackClient, reqBody) {
    console.log("Creating file...");
  }

  static async reviewFile(slackClient, reqBody) {
    console.log("Reviewing file...");
  }

  static async editFile(slackClient, reqBody) {
    console.log("Editing file...");
  }

  static async deleteFile(slackClient, reqBody) {
    console.log("Deleting file...");
  }

  static async shareFile(slackClient, reqBody) {
    console.log("Sharing file...");
  }
}

module.exports = { FileManager };
