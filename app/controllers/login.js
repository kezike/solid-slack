const axios = require('axios');

// Login Dialog
const dialog = {
  "callback_id": "login-request",
  "title": "Login to Solid",
  "submit_label": "Login",
  "notify_on_cancel": true,
  "elements": [
    {
      "type": "text",
      "label": "Solid Account",
      "name": "solid_account",
      "subtype": "url",
      "placeholder": "https://user.solid.community"
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
};

/**
 * @class Login
 */
class Login {
    /**
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Projects
     */
    static exec(slackClient, payload) {
        slackClient.dialog.open({
          trigger_id: payload.trigger_id,
          dialog,
        }).catch((error) => {
           return axios.post(payload.response_url, {
             text: `An error occurred while opening the dialog: ${error.message}`,
           });
        }).catch(console.error);
    }
}

module.exports = { Login };
