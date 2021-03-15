const { getBlockById, setBlockFieldValue } = require('../util/blocks');
const { getSolidClientFromSlackId } = require('../util/solid');
const { httpStatus } = require('../util/http');
const fileManager = require('../assets/file-manager-home');
const fileViewer = require('../assets/file-viewer');

/**
 * @class FileManager
 */
class FileManager {
  /**
   * @static
   * @param {*} slackClient
   * @param {*} reqBody
   * @param {*} command
   * @memberof FileManager
   */
  static async exec(slackClient, reqBody, command) {
    switch (command) {
      case 'profile':
        const profileCommandStatus = await FileManager.loadProfile(slackClient, reqBody);
        return profileCommandStatus;
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
      default:
        return httpStatus.BAD_REQUEST;
    }

    try {
      const { trigger_id } = reqBody;
      const token = slackClient.token;
      const view = JSON.stringify(fileManager, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return httpStatus.OK;
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return httpStatus.BAD_REQUEST;
    }
  }

  static async loadProfile(slackClient, reqBody) {
    console.log("Loading profile...");
    console.log("PROFILE REQ BODY:", reqBody);
    return httpStatus.OK;
    /*try {
      const { trigger_id } = reqBody;
      const token = slackClient.token;
      // const userId = ;
      const block = getBlockById(fileViewer, 'file_viewer');
      const solidClient = getSolidClientFromSlackId(userId);
      const profilePromise = await solidClient.fetch(webId);
      const profile = await profilePromise.text();
      setBlockFieldValue(block, ['text', 'text'], profile);
      const view = JSON.stringify(fileViewer, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return httpStatus.OK;
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return httpStatus.BAD_REQUEST;
    }*/
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
}

module.exports = { FileManager };
