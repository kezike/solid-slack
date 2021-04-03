const { FileManager } = require('../app/controllers/file-manager');
const { solidLogin } = require('../app/controllers/solid');
const { httpStatus } = require('../app/util/http');

// Handle interactive components, like modal buttons
const actionHandler = async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  const type = payload.type;
  const callbackId = payload.view.callback_id;
  switch (callbackId) {
    case 'login-manager':
      const loginResponse = await solidLogin(req, res);
      return loginResponse;
    case 'file-manager':
      const command = payload.actions[0].action_id;
      const contentResponse = await FileManager.exec(req, res, command);
      return contentResponse;
    default:
      return res.status(httpStatus.OK).send(`Unrecognized interactive component \`callback_id\`: \`${callbackId}\``);
  }
};

module.exports = actionHandler;
