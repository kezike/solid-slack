const { SolidNodeClient } = require('solid-node-client');
const { slackClient } = require('../middlewares/slack');
const { getSolidClientFromSlackId, setSolidClientForSlackId } = require('../util/solid');
const { getInputValueFromSubmission } = require('../util/blocks');
const { httpStatus } = require('../util/http');
const $rdf = require('rdflib');

class SolidSlackClient {
  /**
   * auth
   */
  constructor(auth) {
    const session = auth.session;
    const webId = session.webId;
    const store = $rdf.graph();
    const fetch = session.fetch;
    const fetcher = $rdf.fetcher(store, { fetch });
    this.webId = webId;
    this.store = store;
    this.fetch = fetch;
    this.fetcher = fetcher;
    this.session = session;
    this.auth = auth;
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
    return res.status(httpStatus.OK).send('User is already logged into Solid!');
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
    const session = await solidClient.auth.login(loginOptions);
    if (session) {
      console.log('We found a Solid session!');
      setSolidClientForSlackId(userId, solidClient);
      const token = slackClient.token;
      const chatPayload = {
        token,
        channel: userId,
        text: 'Congratulations: you have successfully logged into Solid!',
      };
      console.log('We are sending you a confirmation message...');
      await slackClient.axios.post('chat.postMessage', chatPayload);
      console.log('We have sent you a confirmation message!');
      return res.status(httpStatus.OK).send();
    }
    return res.status(httpStatus.OK).send('We were not able to authenticate you to your Solid account. Please double check your credentials and try again.');
  } catch (e) {
    console.log(`We encountered the following error while logging into Solid: ${e.message}`);
    console.error(JSON.stringify(e, null, 2));
    return res.status(httpStatus.BAD_REQUEST).json(e);
  }
};

module.exports = { solidLogin };
