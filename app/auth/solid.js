const { LoginManager } = require('../controllers/login-manager');
const { SolidNodeClient } = require('solid-node-client');
const { /*httpClient,*/ httpStatus } = require('../util/http');
// const solidClient = new SolidNodeClient();
const { slackIdToSolidClient } = require('./common');
const { slackClient } = require('./slack');

const solidVerify = async (req, res, next) => {
  const slackUserId = req.slack.user_id;
  console.log("SLACK USER ID:", slackUserId);
  let solidClient = slackIdToSolidClient[slackUserId];
  if (!solidClient || !solidClient.session.loggedIn) {
    console.log('Unauthenticated User');
    try {
      // const loginCommandStatus = await LoginManager.exec(slackClient/*, commands*/, req.slack/*, res*/);
      return res.status(httpStatus.UNAUTHORIZED).send("You are not yet connected to a valid Solid account! Please run the following command to login: `/solid login`");
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
      return res.status(httpStatus.BAD_REQUEST).json(e);
    }
  }
  console.log('Authenticated User');
  return next();
}

module.exports = { /*solidClient,*/ solidVerify };
