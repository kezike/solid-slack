const { httpStatus } = require('../util/http');
const { slackClient } = require('../middlewares/slack');
const viewFile = require('../assets/login-manager');

/**
 * @class AccountManager
 */
class AccountManager {
  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} command
   * @memberof AccountManager
   */
  static async exec(req, res, command) {
    switch (command) {
      case 'login':
        const loginResponse = await AccountManager.login(req, res);
        return loginResponse;
    }
  }

  static async login(req, res) {
    console.log("REQ BODY:", req.body);
    console.log("TRIGGER ID:", req.body.trigger_id);
    console.log("RESPONSE URL:", req.body.response_url);
    try {
      const { trigger_id } = req.body;
      const token = slackClient.token;
      const view = JSON.stringify(viewFile, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return { status: httpStatus.OK, message: '' };
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return { status: httpStatus.BAD_REQUEST, message: '' };
    }
  }
}

module.exports = { AccountManager };
