// Useful npm modules
const $rdf = require('rdflib');
const { SolidNodeClient } = require('solid-node-client');
const solidNodeClient = new SolidNodeClient();
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const SPACE = $rdf.Namespace('https://www.w3.org/ns/pim/space#');
const SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');

// Environment variables
const SOLID_ACCOUNT = process.env.SOLID_ACCOUNT;
const SOLID_UNAME = process.env.SOLID_UNAME;
const SOLID_PASS = process.env.SOLID_PASS;

// Solid login credentials
const SOLID_CREDENTIALS = {
  idp: SOLID_ACCOUNT, // TODO: REPLACE WITH VALID SOLID ACCOUNT URL
  username: SOLID_UNAME, // TODO: REPLACE WITH VALID SOLID USERNAME
  password: SOLID_PASS, // TODO: REPLACE WITH VALID SOLID PASSWORD
};

// Retrieve Solid profile card
const getProfile = async () => {
  const session = await solidNodeClient.login(SOLID_CREDENTIALS);
  if (session) {
    const store = $rdf.graph();
    const fetch = session.fetch;
    const fetcher = $rdf.fetcher(store, { fetch });

    const webId = session.webId;
    const profilePromise = await fetcher.load(webId);
    const profileContent = profilePromise['responseText'];
    const photo = fetcher.store.any($rdf.sym(webId), VCARD('hasPhoto'), undefined);
    const account = fetcher.store.any($rdf.sym(webId), SOLID('account'), undefined).value;
    const accountPromise = await fetcher.load(account);
    const accountContent = fetcher.store.match($rdf.sym(account), LDP('contains'), undefined);

    console.log(`Your Profile - ${webId}:\n${profileContent}`);
    console.log(`Your Account - ${account}:\n${JSON.stringify(accountContent, null, 2)}`);
    console.log('Your Picture:', photo);

    await solidNodeClient.logout();
  }
}

// Retrieve Solid data at given URL
const getData = async (url) => {
  const session = await solidNodeClient.login(SOLID_CREDENTIALS);
  if (session) {
    const store = $rdf.graph();
    const fetch = session.fetch;
    const fetcher = $rdf.fetcher(store, { fetch });

    const dataPromise = await fetcher.load(url);
    const data = dataPromise['responseText'];

    console.log(`data at ${url}:`, data);

    await solidNodeClient.logout();
  }
}

// Write Solid data at existing URL
const putData = async (url, data, contentType='text/plain') => {
  const session = await solidNodeClient.login(SOLID_CREDENTIALS);
  if (session) {
    const store = $rdf.graph();
    const fetch = session.fetch;
    const fetcher = $rdf.fetcher(store, { fetch });

    let savedData;
    let savedDataPromise = await fetcher.load(url);
    savedData = savedDataPromise['responseText'];
    console.log(`data at ${url} before put:`, savedData);
    await fetcher.webOperation('PUT', url, { contentType, data });
    await fetcher.refresh(url);
    savedDataPromise = await fetcher.load(url);
    savedData = savedDataPromise['responseText'];
    console.log(`data at ${url} after put:`, savedData);

    await solidNodeClient.logout();
  }
}

// Run any of the methods above with appropriate parameters
getProfile();
// getData(URL);
// putData(URL, DATA);
