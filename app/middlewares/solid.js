const { AccountManager } = require('../controllers/account-manager');
const { SolidNodeClient } = require('solid-node-client');
const { /*httpClient,*/ httpStatus } = require('../util/http');
// const solidClient = new SolidNodeClient();
const { getSolidClientFromSlackId } = require('../util/solid');
const { slackClient } = require('./slack');

const solidVerify = async (req, res, next) => {
  const userId = req.slack.user_id;
  // const responseUrl = req.slack.response_url;
  // console.log("SLACK USER ID:", userId);
  // console.log("RESPONSE URL:", responseUrl);
  let solidClient = getSolidClientFromSlackId(userId);
  if (!(solidClient && solidClient.loggedIn())) {
    console.log('Unauthenticated User');
    try {
      // const accountCommandStatus = await AccountManager.exec(slackClient/*, commands*/, req.slack/*, res*/);
      // const chatPayload = {
      //   text: 'Please run the following command to login to Solid: `/solid login`',
      // };
      // await slackClient.axios.post(responseUrl, chatPayload);
      return res.status(httpStatus.OK).send('You are not authenticated to a Solid account. Please run the following command to login to Solid: `/solid login`');
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).json(e);
    }
  }
  console.log('Authenticated User Session:', solidClient.session);
  return next();
}

module.exports = { /*solidClient,*/ solidVerify };
