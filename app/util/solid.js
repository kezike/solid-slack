const slackIdToSolidClient = {};

const getSolidClientFromSlackId = (slackId) => {
  return slackIdToSolidClient[slackId];
};

const setSolidClientForSlackId = (slackId, solidClient) => {
  slackIdToSolidClient[slackId] = solidClient;
};

module.exports = { getSolidClientFromSlackId, setSolidClientForSlackId };
