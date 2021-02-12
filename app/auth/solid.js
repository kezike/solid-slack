const HttpStatus = require('http-status-codes');
const { SolidNodeClient } = require('solid-node-client');
const client = new SolidNodeClient();

const login = async (req, res, next) => {
    const payload = JSON.parse(req.body.payload);
    const submission = payload.submission;
    const { solid_account, solid_uname, solid_pass } = submission;
    const loginOptions = {
      idp: solid_account,
      username: solid_uname,
      password: solid_pass
    };
    const session = await client.login(loginOptions);
    if (session) {
      console.log('Solid login successful!');
      next();
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send('Solid login failed');
    }
}

module.exports = { client, login };
