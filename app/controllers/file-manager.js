const {
  getBlockById,
  setBlockFieldValue,
  customizeProfile,
  addProfileBlocks,
  addAccountBlocks,
} = require('../util/blocks');
const _ = require('lodash');
const { getSolidClientFromSlackId } = require('../util/solid');
const { slackClient } = require('../middlewares/slack');
const { httpStatus } = require('../util/http');
const fileManager = require('../assets/file-manager-home');
const profileViewer = require('../assets/profile-viewer');
const accountManager = require('../assets/account-manager');
const { FOAF, VCARD, SOLID } = require('../util/namespaces');
const $rdf = require('rdflib');

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
        const profileResponse = await FileManager.loadProfile(req, res);
        return profileResponse;
      case 'account':
        const accountResponse = await FileManager.loadAccount(req, res);
        return accountResponse;
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
  }

  static async loadProfile(req, res) {
    try {
      const profileViewerConfig = _.cloneDeep(profileViewer);
      const trigger_id = req.body.trigger_id;
      const token = slackClient.token;
      const userId = req.body.user_id;
      // const block = getBlockById(profileViewerConfig, 'file_viewer');
      const solidClient = getSolidClientFromSlackId(userId);
      const webId = solidClient.webId;
      const profilePromise = await solidClient.fetcher.load(webId);
      const profileContent = profilePromise['responseText'];
      const profileName = solidClient.fetcher.store.any($rdf.sym(webId), FOAF('name'), undefined);
      const profilePicture = solidClient.fetcher.store.any($rdf.sym(webId), VCARD('hasPhoto'), undefined);
      customizeProfile(profileViewerConfig, profileName, profilePicture);
      // const statements = solidClient.fetcher.store.statements;
      const statements = solidClient.fetcher.store.match($rdf.sym(webId), undefined, undefined);
      addProfileBlocks(profileViewerConfig, statements);
      // setBlockFieldValue(block, ['text', 'text'], profileContent);
      const view = JSON.stringify(profileViewerConfig, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async loadAccount(req, res) {
    try {
      const accountManagerConfig = _.cloneDeep(accountManager);
      const { trigger_id } = req.body;
      const token = slackClient.token;
      const userId = req.body.user_id;
      const solidClient = getSolidClientFromSlackId(userId);
      const webId = solidClient.webId;
      await solidClient.fetcher.load(webId);
      const account = solidClient.fetcher.store.any($rdf.sym(webId), SOLID('account'), undefined).value;
      await solidClient.fetcher.load(account);
      const statements = solidClient.fetcher.store.match($rdf.sym(account), LDP('contains'), undefined);
      addAccountBlocks(accountManagerConfig, statements);
      const view = JSON.stringify(accountManagerConfig, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
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
