const { WebClient } = require('@slack/client');
const slackToken = process.env.SLACK_ACCESS_TOKEN;
const slackClient = new WebClient(slackToken);
const FILE_SIZE_LIMIT = 3000;
const VIEW_STACK_LIMIT = 3;

module.exports = { slackClient, FILE_SIZE_LIMIT, VIEW_STACK_LIMIT };
