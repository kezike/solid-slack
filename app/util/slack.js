const { WebClient } = require('@slack/client');
const slackToken = process.env.SLACK_ACCESS_TOKEN;
const slackClient = new WebClient(slackToken);

module.exports = { slackClient };
