const $rdf = require('rdflib');

const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');

module.exports = { LDP, FOAF, VCARD, SOLID };
