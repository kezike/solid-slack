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
    console.log('Unauthenticated: logging in new user');
    try {
      const loginCommandStatus = await LoginManager.exec(slackClient/*, commands*/, req.slack/*, res*/);
      return res.status(loginCommandStatus).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
      return res.status(httpStatus.BAD_REQUEST).json(e);
    }
  }
  console.log('Authenticated: proceeding to desired action');
  return next();
}

module.exports = { /*solidClient,*/ solidVerify };
