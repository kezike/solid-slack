const HttpStatus = require('http-status-codes');
const { Login } = require('../controllers/login');
const { SolidNodeClient } = require('solid-node-client');
// const solidClient = new SolidNodeClient();
const { slackIdToSolidClient } = require('./common');
const { slackClient } = require('./slack');

const solidLogin = async (req, res, next) => {
  console.log("REQ.BODY:", JSON.stringify(req.body, null, 2));
  const slackUserId = req.body.user_id;
  let solidClient = slackIdToSolidClient[slackUserId];
  if (!solidClient || !solidClient.session.loggedIn) {
    console.log('Unauthenticated: logging new user in');
    return Login.exec(slackClient, req.body);
  }
  console.log('Authenticated: proceeding to desired action');
  return next();
}

module.exports = { /*solidClient,*/ solidLogin };
