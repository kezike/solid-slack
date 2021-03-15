const { SolidNodeClient } = require('solid-node-client');
const { slackClient } = require('../middlewares/slack');
const { getInputValueFromSubmission } = require('../util/blocks');
const { getSolidClientFromSlackId, setSolidClientForSlackId } = require('../util/solid');
const { httpStatus } = require('../util/http');

const solidLogin = async (req, res) => {
  const submission = JSON.parse(req.body.payload);
  const userId = submission.user.id;
  let solidClient = getSolidClientFromSlackId(userId);
  if (solidClient && solidClient.session && solidClient.session.loggedIn) {
    return res.status(httpStatus.OK).send('User is already logged into Solid!');
  }
  const submission = JSON.parse(req.body.payload);
  const solid_account = getInputValueFromSubmission(submission, 'solid_account');
  const solid_uname = getInputValueFromSubmission(submission, 'solid_uname');
  const solid_pass = getInputValueFromSubmission(submission, 'solid_pass');
  const loginOptions = {
    idp: solid_account,
    username: solid_uname,
    password: solid_pass,
  };
  solidClient = new SolidNodeClient();
  const session = await solidClient.login(loginOptions);
  const token = slackClient.token;
  if (session) {
    setSolidClientForSlackId(userId, solidClient);
    const chatPayload = {
      token,
      channel: userId,
      text: 'Congratulations: you have successfully logged into Solid!',
    };
    try {
      await slackClient.axios.post('chat.postMessage', chatPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).json(e);
    }
  }
  return res.status(httpStatus.OK).send('We were not able to authenticate you to your Solid account. Please double check your credentials and try again.');
};

module.exports = { solidLogin };
