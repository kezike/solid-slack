const { LoginManager } = require('../controllers/login-manager');
const { SolidNodeClient } = require('solid-node-client');
const { /*httpClient,*/ httpStatus } = require('../util/http');
// const solidClient = new SolidNodeClient();
const { slackIdToSolidClient } = require('./common');
const { slackClient } = require('./slack');

const solidVerify = async (req, res, next) => {
  const userId = req.slack.user_id;
  const responseUrl = req.slack.response_url;
  console.log("SLACK USER ID:", userId);
  console.log("RESPONSE URL:", responseUrl);
  let solidClient = slackIdToSolidClient[userId];
  if (!solidClient || !solidClient.session.loggedIn) {
    console.log('Unauthenticated User');
    try {
      // const loginCommandStatus = await LoginManager.exec(slackClient/*, commands*/, req.slack/*, res*/);
      const chatPayload = {
        text: "Please run the following command to login to Solid: `/solid login`",
      };
      await slackClient.axios.post(responseUrl, chatPayload);
      console.log("Sent login message to slack channel");
      return res.status(httpStatus.OK).send("User is not authenticated to a Solid account");
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
      return res.status(httpStatus.BAD_REQUEST).json(e);
    }
  }
  console.log('Authenticated User');
  return next();
}

module.exports = { /*solidClient,*/ solidVerify };
