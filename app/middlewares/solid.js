const { AccountManager } = require('../controllers/account-manager');
const { SolidNodeClient } = require('solid-node-client');
const { httpStatus } = require('../util/http');
const { getSolidClientFromSlackId } = require('../util/solid');
const { slackClient } = require('./slack');

const solidVerify = async (req, res, next) => {
  const userId = req.slack.user_id;
  let solidClient = getSolidClientFromSlackId(userId);
  if (!(solidClient && solidClient.loggedIn())) {
    try {
      return res.status(httpStatus.OK).send('You are not authenticated to a Solid account. Please run the following command to login to Solid: `/solid login`');
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).json(e);
    }
  }
  return next();
}

module.exports = { solidVerify };
