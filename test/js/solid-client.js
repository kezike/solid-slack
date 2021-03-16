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
        const webId = session.webId;
        console.log(`Your WebID: ${webId}`);
        const profilePromise = await solidNodeClient.fetch(webId);
        const profile = await profilePromise.text();
        console.log(`Your Solid Profile:\n${profile}`);
        solidNodeClient.logout();
    }
}

main();
