const qs = require('qs');
const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');
const { httpStatus } = require('../util/http');
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

const slackVerify = (req, res, next) => {
  // Define important variables
  const headerStr = qs.stringify(req.headers, {format: 'RFC1738'});
  const bodyStr = qs.stringify(req.body, {format: 'RFC1738'});
  const ts = req.headers['x-slack-request-timestamp'];
  const sigSlack = req.headers['x-slack-signature'];

  // Check if this is a valid Slack request
  if (!sigSlack || !ts) {
    return res.status(httpStatus.UNAUTHORIZED).json({error: 'Slack request invalid'});
  }

  // Check if the timestamp is too old
  const fiveMinsAgo = ~~(Date.now() / 1000) - (60 * 5);
  if (ts < fiveMinsAgo) {
    return res.status(httpStatus.REQUEST_TIMEOUT).json({error: 'Slack request timeout'});
  }

  // Check that server owns Slack signing secret
  if (!slackSigningSecret) {
    return res.status(httpStatus.BAD_REQUEST).send('Slack signing secret empty');
  }

  const sigBaseStr = `v0:${ts}:${bodyStr}`;
  const sigMine = `v0=${crypto.createHmac('sha256', slackSigningSecret)
                            .update(sigBaseStr, 'utf8')
                            .digest('hex')}`;

  // Check that the request signature matches expected value
  if (crypto.timingSafeEqual(
    Buffer.from(sigMine, 'utf8'),
    Buffer.from(sigSlack, 'utf8'))) {
    req.slack = req.body;
    return next();
  } else {
    return res.status(httpStatus.UNAUTHORIZED).send('Slack signature invalid');
  }
};

module.exports = { slackVerify };
