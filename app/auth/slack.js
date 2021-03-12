const qs = require('qs');
const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');
const HttpStatus = require('http-status-codes');
const { WebClient } = require('@slack/client');
const slackToken = process.env.SLACK_ACCESS_TOKEN;
const slackClient = new WebClient(slackToken);

const slackVerify = (req, res, next) => {
    console.log('Verifying signature...');

    // Define important variables
    const headerStr = qs.stringify(req.headers, {format : 'RFC1738'});
    const bodyStr = qs.stringify(req.body, {format : 'RFC1738'});
    const ts = req.headers['x-slack-request-timestamp'];
    const sigSlack = req.headers['x-slack-signature'];
    const sigSecret = process.env.SLACK_SIGNING_SECRET;

    // Check if this is a valid Slack request
    if (!sigSlack || !ts) {
      return res.status(HttpStatus.UNAUTHORIZED).json({error: 'Slack request invalid'});
    }

    // Check if the timestamp is too old
    const fiveMinsAgo = ~~(Date.now() / 1000) - (60 * 5);
    if (ts < fiveMinsAgo) {
      return res.status(HttpStatus.REQUEST_TIMEOUT).json({error: 'Slack request timeout'});
    }

    // Check that server owns Slack signing secret
    if (!sigSecret) {
      return res.status(HttpStatus.BAD_REQUEST).send('Slack signing secret empty');
    }

    const sigBaseStr = `v0:${ts}:${bodyStr}`;
    const sigMine = `v0=${crypto.createHmac('sha256', sigSecret)
                              .update(sigBaseStr, 'utf8')
                              .digest('hex')}`;

    // Check that the request signature matches expected value
    if (crypto.timingSafeEqual(
      Buffer.from(sigMine, 'utf8'),
      Buffer.from(sigSlack, 'utf8'))) {
      console.log('Slack client successfully verified');
      next();
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send('Slack signature invalid');
    }
};

module.exports = { slackClient, slackVerify };
