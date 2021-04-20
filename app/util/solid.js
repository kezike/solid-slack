const slackIdToSolidClient = {};

const getSolidClientFromSlackId = (slackId) => {
  return slackIdToSolidClient[slackId];
};

const setSolidClientForSlackId = (slackId, solidClient) => {
  slackIdToSolidClient[slackId] = solidClient;
};

const forgetSolidClientForSlackId = (slackId) => {
  delete slackIdToSolidClient[slackId];
};

module.exports = { getSolidClientFromSlackId, setSolidClientForSlackId, forgetSolidClientForSlackId };
