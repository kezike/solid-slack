const {
  getBlockById,
  setFieldValue,
  customizeProfile,
  addFileBlocks,
  addEditBlocks,
  addProfileBlocks,
  addContainerBlocks,
  getInputValueFromPayload,
} = require('../util/blocks');
const _ = require('lodash');
const { getSolidClientFromSlackId } = require('../util/solid');
const { slackClient } = require('../util/slack');
const { httpStatus } = require('../util/http');
const profileViewer = require('../assets/profile-viewer');
const fileManager = require('../assets/file-manager');
const { LDP, FOAF, VCARD, SOLID } = require('../util/namespaces');
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
  static async exec(req, res, command) {
    switch (command) {
      case 'profile':
        const profileResponse = await FileManager.loadProfile(req, res);
        return profileResponse;
      case 'account':
        const accountResponse = await FileManager.loadAccount(req, res);
        return accountResponse;
      case 'load-content':
        const loadResponse = await FileManager.loadContent(req, res);
        return loadResponse;
      case 'edit-content':
        const editResponse = await FileManager.editContent(req, res);
        return editResponse;
      case 'save-content':
        const saveResponse = await FileManager.saveContent(req, res);
        return saveResponse;
      case 'refresh-content':
        const refreshResponse = await FileManager.refreshContent(req, res);
        return refreshResponse;
      case 'create-content':
        const createCommandStatus = await FileManager.createContent(req, res);
        return createCommandStatus;
      case 'delete-content':
        const deleteCommandStatus = await FileManager.deleteContent(req, res);
        return deleteCommandStatus;
      case 'share-content':
        const shareCommandStatus = await FileManager.shareContent(req, res);
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
      const solidClient = getSolidClientFromSlackId(userId);
      const webId = solidClient.webId;
      const profilePromise = await solidClient.fetcher.load(webId);
      const profileContent = profilePromise['responseText'];
      const profileName = solidClient.fetcher.store.any($rdf.sym(webId), FOAF('name'), undefined);
      const profilePicture = solidClient.fetcher.store.any($rdf.sym(webId), VCARD('hasPhoto'), undefined);
      customizeProfile(profileViewerConfig, profileName, profilePicture);
      const statements = solidClient.fetcher.store.match($rdf.sym(webId), undefined, undefined);
      addProfileBlocks(profileViewerConfig, statements);
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
      const fileManagerConfig = _.cloneDeep(fileManager);
      const trigger_id = req.body.trigger_id;
      const token = slackClient.token;
      const userId = req.body.user_id;
      const solidClient = getSolidClientFromSlackId(userId);
      const webId = solidClient.webId;
      await solidClient.fetcher.load(webId);
      const account = solidClient.fetcher.store.any($rdf.sym(webId), SOLID('account'), undefined).value;
      await solidClient.fetcher.load(account);
      const statements = solidClient.fetcher.store.match($rdf.sym(account), LDP('contains'), undefined);
      fileManagerConfig.private_metadata = `{"url":"${account}","level":1}`;
      addContainerBlocks(fileManagerConfig, statements, account);
      const view = JSON.stringify(fileManagerConfig, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async loadContent(req, res) {
    try {
      const fileManagerConfig = _.cloneDeep(fileManager);
      const payload = JSON.parse(req.body.payload);
      const trigger_id = payload.trigger_id;
      const url = payload.actions[0].value;
      const userId = payload.user.id;
      const token = slackClient.token;
      const metadata = payload.view.private_metadata ? JSON.parse(payload.view.private_metadata) : { level: 1 };
      const level = metadata.level + 1;
      const block = getBlockById(fileManagerConfig, 'file_header');
      const solidClient = getSolidClientFromSlackId(userId);
      const resourcePromise = await solidClient.fetcher.load(url);
      let resourceContent = solidClient.fetcher.store.match($rdf.sym(url), LDP('contains'), undefined);
      setFieldValue(fileManagerConfig, ['close', 'text'], 'Back');
      setFieldValue(block, ['text', 'text'], url);
      fileManagerConfig.private_metadata = `{"url":"${url}","level":${level}}`;
      if (resourceContent.length > 0) {
        // resource is a container
        // NOTE: resourceContent is an array of RDF statements here
        addContainerBlocks(fileManagerConfig, resourceContent, url);
      } else {
        // resource is a file
        // NOTE: resourceContent is a string here
        resourceContent = resourcePromise['responseText'];
        const contentType = resourcePromise['headers'].get('Content-Type');
        addFileBlocks(fileManagerConfig, contentType, resourceContent, url);
      }
      const view = JSON.stringify(fileManagerConfig, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.push', viewPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async editContent(req, res) {
    try {
      const fileManagerConfig = _.cloneDeep(fileManager);
      const payload = JSON.parse(req.body.payload);
      const trigger_id = payload.trigger_id;
      const url = payload.actions[0].value;
      const userId = payload.user.id;
      const token = slackClient.token;
      const metadata = payload.view.private_metadata ? JSON.parse(payload.view.private_metadata) : { level: 1 };
      const level = metadata.level + 1;
      const block = getBlockById(fileManagerConfig, 'file_header');
      const solidClient = getSolidClientFromSlackId(userId);
      const resourcePromise = await solidClient.fetcher.load(url);
      const resourceContent = resourcePromise['responseText'];
      setFieldValue(fileManagerConfig, ['close', 'text'], 'Cancel');
      setFieldValue(fileManagerConfig, ['callback_id'], 'save-content');
      setFieldValue(block, ['text', 'text'], url);
      fileManagerConfig.private_metadata = `{"url":"${url}","level":${level}}`;
      addEditBlocks(fileManagerConfig, resourceContent, url);
      const view = JSON.stringify(fileManagerConfig, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.push', viewPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async saveContent(req, res) {
    try {
      const payload = JSON.parse(req.body.payload);
      const userId = payload.user.id;
      const metadata = JSON.parse(payload.view.private_metadata);
      const url = metadata.url;
      const solidClient = getSolidClientFromSlackId(userId);
      const resourcePromise = await solidClient.fetcher.load(url);
      const contentType = resourcePromise['headers'].get('Content-Type');
      const data = getInputValueFromPayload(payload, `save_${url}`);
      await solidClient.fetcher.webOperation('PUT', url, { contentType, data });
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async refreshContent(req, res) {
    try {
      const payload = JSON.parse(req.body.payload);
      const trigger_id = payload.trigger_id;
      let viewConfig = payload.view;
      const view_id = viewConfig.id;
      const hash = viewConfig.hash;
      const userId = payload.user.id;
      const token = slackClient.token;
      const metadata = JSON.parse(viewConfig.private_metadata);
      const url = metadata.url;
      const solidClient = getSolidClientFromSlackId(userId);
      await solidClient.fetcher.refresh(url);
      const resourcePromise = await solidClient.fetcher.load(url);
      const resourceContent = resourcePromise['responseText'];
      const block = getBlockById(viewConfig, `load_${url}`);
      setFieldValue(block, ['text', 'text'], resourceContent);
      viewConfig = {
        type: viewConfig.type,
        title: viewConfig.title,
        close: viewConfig.close,
        blocks: viewConfig.blocks,
        callback_id: viewConfig.callback_id,
      };
      const view = JSON.stringify(viewConfig, null, 2);
      const viewPayload = { token, trigger_id, view, view_id, hash };
      await slackClient.axios.post('views.update', viewPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async createContent(req, res) {
    try {
      console.log("creating content...");
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async deleteContent(req, res) {
    try {
      console.log("deleting content...");
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async shareContent(req, res) {
    try {
      console.log("sharing content...");
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }
}

module.exports = { FileManager };
