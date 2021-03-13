// useful npm modules
const { SolidNodeClient } = require('solid-node-client');
const solidNodeClient = new SolidNodeClient();

// environment variables
const SOLID_ACCOUNT = process.env.SOLID_ACCOUNT;
const SOLID_UNAME = process.env.SOLID_UNAME;
const SOLID_PASS = process.env.SOLID_PASS;

const loginOptions = {
  idp: SOLID_ACCOUNT, // TODO: REPLACE WITH VALID SOLID ACCOUNT URL
  username: SOLID_UNAME, // TODO: REPLACE WITH VALID SOLID USERNAME
  password: SOLID_PASS, // TODO: REPLACE WITH VALID SOLID PASSWORD
};

const main = async () => {
    const session = await solidNodeClient.login(loginOptions);
    if (session) {
        const response = await solidNodeClient.fetch('http://example.com'); // TODO: REPLACE WITH VALID FILE URL
        const text = await response.text();
        console.log("Your requested file:\n", text);
        solidNodeClient.logout();
    }
}

main()

