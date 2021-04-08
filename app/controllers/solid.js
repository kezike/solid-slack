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

  loggedIn() {
    return this.session.loggedIn;
  }
}

const solidLogin = async (req, res) => {
  const submission = JSON.parse(req.body.payload);
  const userId = submission.user.id;
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
  try {
    const session = await solidClient.login(loginOptions);
    if (session) {
      setSolidClientForSlackId(userId, solidClient);
      const token = slackClient.token;
      const chatPayload = {
        token,
        channel: userId,
        text: 'Congratulations: you have successfully logged into Solid!',
      };
      await slackClient.axios.post('chat.postMessage', chatPayload);
      return res.status(httpStatus.OK).send();
    }
    return res.status(httpStatus.OK).send('We were not able to authenticate you to your Solid account. Please double check your credentials and try again.');
  } catch (e) {
    const errorMessage = `We encountered the following error while logging into Solid: ${e.message}`;
    console.error(JSON.stringify(e, null, 2));
    return res.status(httpStatus.BAD_REQUEST).send(errorMessage);
  }
};

module.exports = { solidLogin };
