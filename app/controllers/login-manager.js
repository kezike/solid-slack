const { httpStatus } = require('../common/http');
const viewFile = require('../assets/login-manager');
// const axios = require('axios');

/*// Login Dialog
const dialog = {
  "callback_id": "login-manager",
  "title": "Login to Solid",
  "submit_label": "Login",
  "notify_on_cancel": true,
  "elements": [
    {
      "type": "text",
      "label": "Solid Account",
      "name": "solid_account",
      "subtype": "url",
      "placeholder": "https://user.solid.inrupt.com"
    },
    {
      "type": "text",
      "label": "Username",
      "name": "solid_uname",
      "placeholder": "myusername"
    },
    {
      "type": "text",
      "label": "Password",
      "name": "solid_pass",
      "placeholder": "mypassword"
    }
  ]
};*/

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
    console.log("TRIGGER ID:", reqBody.trigger_id);
    console.log("RESPONSE URL:", reqBody.response_url);
    try {
      const { trigger_id } = reqBody;
      const token = slackClient.token;
      const view = JSON.stringify(viewFile, null, 4);
      const viewPayload = { token, trigger_id, view };
      console.log("opening modal...");
      const meep = await slackClient.axios.post('views.open', viewPayload);
      console.log("opened modal!");
      console.log("view.open response:", meep);
      return httpStatus.OK;
    } catch (e) {
      console.error(JSON.stringify(e, null, 4));
      return httpStatus.BAD_REQUEST;
    }
    /*slackClient.dialog.open({
      trigger_id: payload.trigger_id,
      dialog
    }).catch((error) => {
       return axios.post(payload.response_url, {
         text: `An error occurred while opening the dialog: ${error.message}`,
       });
    }).catch(console.error);*/
  }
}

module.exports = { LoginManager };
