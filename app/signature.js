const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');
const HttpStatus = require('http-status-codes');

const verifySignature = (req, res, next) => {
    const signature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];
    if (!signature || !timestamp) {
      return res.status(HttpStatus.UNAUTHORIZED).json({error: "Invalid Slack Request"});
    }

    const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
    const [version, hash] = signature.split('=');

    // Check if the timestamp is too old
    const fiveMinutesAgo = ~~(Date.now() / 1000) - (60 * 5);
    if (timestamp < fiveMinutesAgo) {
      return res.status(HttpStatus.REQUEST_TIMEOUT).json({error: "Slack Request Timed Out"});
    }

    hmac.update(`${version}:${timestamp}:${req.rawBody}`);

    // Check that the request signature matches expected value
    if (timingSafeCompare(hmac.digest('hex'), hash)) {
      next();
    }

    return res.status(HttpStatus.UNAUTHORIZED).json({error: "Invalid Slack Signature"});
};

module.exports = { verifySignature };
