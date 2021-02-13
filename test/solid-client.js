const { SolidNodeClient } = require('solid-node-client');
const solidNodeClient = new SolidNodeClient();
const loginOptions = {
  idp: 'REPLACE WITH VALID SOLID ACCOUNT URL',
  username: 'REPLACE WITH VALID SOLID USERNAME',
  password: 'REPLACE WITH VALID SOLID PASSWORD'
};

const main = async () => {
    const session = await solidNodeClient.login(loginOptions);
    if (session) {
        console.log(`logged in as <${session.webId}>`);
        const response = await solidNodeClient.fetch('REPLACE WITH VALID FILE URL');
        console.log(await response.text())
        solidNodeClient.logout();
    }
}

main()

