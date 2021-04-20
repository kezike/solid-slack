const { SolidNodeClient } = require('solid-node-client');
const { slackClient } = require('../util/slack');
const { getSolidClientFromSlackId, setSolidClientForSlackId } = require('../util/solid');
const { getInputValueFromSubmission } = require('../util/blocks');
const { httpStatus } = require('../util/http');
const $rdf = require('rdflib');

class SolidSlackClient {
  /**
   * auth
   */
  constructor(auth) {
    this.auth = auth;
  }

  async login(loginOptions) {
    const session = await this.auth.login(loginOptions);
    const webId = session.webId;
    const store = $rdf.graph();
    const fetch = session.fetch;
    const fetcher = $rdf.fetcher(store, { fetch });
    this.webId = webId;
    this.fetcher = fetcher;
    this.session = session;
    return session;
  }

  async logout() {
    await this.auth.logout();
  }

  loggedIn() {
    return this.session.loggedIn;
  }
}

const solidLogin = async (req, res) => {
  const submission = JSON.parse(req.body.payload);
  const userId = submission.user.id;
  const token = slackClient.token;
  let solidClient = getSolidClientFromSlackId(userId);
  if (solidClient && solidClient.loggedIn()) {
    return res.status(httpStatus.OK).send('You are already logged into Solid!');
  }
  const solid_account = getInputValueFromSubmission(submission, 'solid_account');
  const solid_uname = getInputValueFromSubmission(submission, 'solid_uname');
  const solid_pass = getInputValueFromSubmission(submission, 'solid_pass');
  const loginOptions = {
    idp: solid_account,
    username: solid_uname,
    password: solid_pass,
  };
  const nodeClient = new SolidNodeClient();
  solidClient = new SolidSlackClient(nodeClient);
  const responsePayload = {
    token,
    channel: userId,
    text: ''
  };
  try {
    const session = await solidClient.login(loginOptions);
    if (session) {
      setSolidClientForSlackId(userId, solidClient);
      responsePayload.text = 'Hello, you have successfully logged into Solid!';
    } else {
      responsePayload.text = 'We were not able to authenticate you to your Solid account. Please double check each entry and try again.';
    }
    await slackClient.axios.post('chat.postMessage', responsePayload);
    return res.status(httpStatus.OK).send();
  } catch (e) {
    responsePayload.text = `Sorry, we encountered the following error while logging into Solid: ${e.message}`;
    await slackClient.axios.post('chat.postMessage', responsePayload);
    return res.status(httpStatus.OK).send();
  }
};

const solidLogout = async (req, res) => {
  const submission = JSON.parse(req.body.payload);
  const userId = submission.user.id;
  const token = slackClient.token;
  const solidClient = getSolidClientFromSlackId(userId);
  if (!solidClient) {
    return res.status(httpStatus.OK).send('You are not logged into Solid!');
  }
  const responsePayload = {
    token,
    channel: userId,
    text: ''
  };
  try {
    await solidClient.logout();
    responsePayload.text = 'Goodbye, you have successfully logged out of Solid!';
    await slackClient.axios.post('chat.postMessage', responsePayload);
    return res.status(httpStatus.OK).send();
  } catch (e) {
    responsePayload.text = `Sorry, we encountered the following error while logging out of Solid: ${e.message}`;
    await slackClient.axios.post('chat.postMessage', responsePayload);
    return res.status(httpStatus.OK).send();
  }
};

module.exports = { solidLogin, solidLogout };
