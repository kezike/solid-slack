const {
  getBlockById,
  setFieldValue,
  customizeProfile,
  addFileBlocks,
  addEditBlocks,
  addProfileBlocks,
  addContainerBlocks,
  getInputValueFromSubmission,
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
      case 'create':
        const createCommandStatus = await FileManager.createFile(req, res);
        return createCommandStatus;
      case 'review':
        const reviewCommandStatus = await FileManager.reviewFile(req, res);
        return reviewCommandStatus;
      case 'delete':
        const deleteCommandStatus = await FileManager.deleteFile(req, res);
        return deleteCommandStatus;
      case 'share':
        const shareCommandStatus = await FileManager.shareFile(req, res);
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
      console.log('METADATA:', metadata);
      console.log('LEVEL:', level);
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
      console.log('saving content...');
      // const fileManagerConfig = _.cloneDeep(fileManager);
      console.log('parsing payload...');
      const payload = JSON.parse(req.body.payload);
      console.log('parsed payload:', payload);
      // const trigger_id = payload.trigger_id;
      // console.log('retrieving previous_view_id...');
      // const view_id = payload.view.previous_view_id;
      // console.log('retrieved previous_view_id:', view_id);
      // console.log('retrieving hash...');
      // const hash = payload.view.hash;
      // console.log('retrieved hash:', hash);
      const userId = payload.user.id;
      // const token = slackClient.token;
      console.log('retrieving metadata...');
      const metadata = JSON.parse(payload.view.private_metadata);
      console.log('retrieved metadata:', metadata);
      const url = metadata.url;
      console.log('retrieved url:', url);
      const solidClient = getSolidClientFromSlackId(userId);
      const resourcePromise = await solidClient.fetcher.load(url);
      const contentType = resourcePromise['headers'].get('Content-Type');
      console.log('getting block by id:', `load_${url}`);
      // const block = getBlockById(fileManagerConfig, `load_${url}`);
      // console.log('block for', `load_${url}:`, block);
      console.log('getting input data for id:', `save_${url}`);
      const data = getInputValueFromSubmission(payload, `save_${url}`);
      console.log('data for', `save_${url}:`, data);
      // setFieldValue(block, ['text', 'text'], data);
      console.log('saving', data, 'to', url);
      await solidClient.fetcher.webOperation('PUT', url, { contentType, data });
      console.log('saved', data, 'to', url);
      /*const view = JSON.stringify(fileManagerConfig, null, 2);
      const viewPayload = { token, trigger_id, view, view_id, hash };
      await slackClient.axios.post('views.update', viewPayload);*/
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async refreshContent(req, res) {
    try {
      console.log('refreshing content...');
      const viewConfig = payload.view;
      const payload = JSON.parse(req.body.payload);
      console.log('parsed payload:', payload);
      const trigger_id = payload.trigger_id;
      const view_id = viewConfig.id;
      console.log('retrieved view_id:', view_id);
      const hash = viewConfig.hash;
      console.log('retrieved hash:', hash);
      const userId = payload.user.id;
      const token = slackClient.token;
      const metadata = JSON.parse(viewConfig.private_metadata);
      console.log('retrieved metadata:', metadata);
      const url = metadata.url;
      console.log('retrieved url:', url);
      const solidClient = getSolidClientFromSlackId(userId);
      await solidClient.fetcher.refresh(url);
      const resourcePromise = await solidClient.fetcher.load(url);
      const resourceContent = resourcePromise['responseText'];
      const block = getBlockById(viewConfig, `load_${url}`);
      console.log('block for', `load_${url}:`, block);
      setFieldValue(block, ['text', 'text'], resourceContent);
      const view = JSON.stringify(viewConfig, null, 2);
      const viewPayload = { token, trigger_id, view, view_id, hash };
      await slackClient.axios.post('views.update', viewPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }

  static async createFile(req, res) {
    console.log("Creating file...");
  }

  static async reviewFile(req, res) {
    console.log("Reviewing file...");
  }

  static async deleteFile(req, res) {
    console.log("Deleting file...");
  }

  static async shareFile(req, res) {
    console.log("Sharing file...");
  }
}

module.exports = { FileManager };
