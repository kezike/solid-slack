const { httpStatus } = require('../util/http');
const viewFile = require('../assets/login-manager');

/**
 * @class LoginManager
 */
class LoginManager {
  /**
   * @static
   * @param {*} slackClient
   * @param {*} reqBody
   * @memberof LoginManager
   */
  static async exec(slackClient, reqBody) {
    console.log("REQ BODY:", reqBody);
    console.log("TRIGGER ID:", reqBody.trigger_id);
    console.log("RESPONSE URL:", reqBody.response_url);
    try {
      const { trigger_id } = reqBody;
      const token = slackClient.token;
      const view = JSON.stringify(viewFile, null, 2);
      const viewPayload = { token, trigger_id, view };
      await slackClient.axios.post('views.open', viewPayload);
      return httpStatus.OK;
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return httpStatus.BAD_REQUEST;
    }
  }
}

module.exports = { LoginManager };
