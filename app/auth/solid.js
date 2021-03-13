const HttpStatus = require('http-status-codes');
const { SolidNodeClient } = require('solid-node-client');
// const solidClient = new SolidNodeClient();
const { slackIdToSolidClient } = require('./common');

const solidLogin = async (req, res, next) => {
    const slackUserId = req.body.user_id;
    console.log("slackUserId:", slackUserId);
    if (!(slackUserId in slackIdToSolidClient) || !slackIdToSolidClient.session.loggedIn) {
      const payload = JSON.parse(req.body.payload);
      const submission = payload.submission;
      const { solid_account, solid_uname, solid_pass } = submission;
      const loginOptions = {
        idp: solid_account,
        username: solid_uname,
        password: solid_pass
      };
      const session = await solidClient.login(loginOptions);
      if (session) {
        const solidClient = new SolidNodeClient();
        slackIdToSolidClient[slackUserId] = solidClient;
        return next();
      }
      return res.status(HttpStatus.UNAUTHORIZED).send('Solid login failed');
    }
    return next();
}

module.exports = { /*solidClient,*/ solidLogin };
