const _ = require('lodash');
const { httpStatus } = require('../util/http');
const { slackClient } = require('../util/slack');
const loginManager = require('../assets/login-manager');

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
    try {
      const trigger_id = req.body.trigger_id;
      const token = slackClient.token;
      const view = JSON.stringify(loginManager, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return res.status(httpStatus.OK).send();
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return res.status(httpStatus.BAD_REQUEST).send();
    }
  }
}

module.exports = { AccountManager };
