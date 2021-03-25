const urlVal = require('valid-url');

// Extract submitted value from modal input id
const getInputValueFromSubmission = (submission, id) => {
  const view = submission.view;
  const values = view.state.values;
  const blockId = `${id}_block`;
  const inputId = `${id}_input`;
  return values[blockId][inputId].value.trim();
};

// Retrieve block by id
const getBlockById = (viewConfig, id) => {
  const blockId = `${id}_block`;
  const blocks = viewConfig.blocks;
  return blocks.find((block) => block.block_id === blockId);
};

// Get value of block field at nested path
const getBlockFieldValue = (block, path) => {
  let scope = block;
  for (let i = 0; i < path.length; i++) {
    const field = path[i];
    scope = scope[field];
  }
  return scope;
};

// Set value of block field at nested path
const setBlockFieldValue = (block, path, value) => {
  let scope = block;
  for (let i = 0; i < path.length; i++) {
    const field = path[i];
    if (i === path.length - 1) {
      scope[field] = value;
    } else {
      scope = scope[field];
    }
  }
};

// Add profile picture to file viewer
const customizeProfile = (viewConfig, name, picture) => {
  const profileBlock = getBlockById(viewConfig, 'profile_picture');
  if (name) {
    setBlockFieldValue(profileBlock, ['title', 'text'], name.value);
  }
  if (picture) {
    setBlockFieldValue(profileBlock, ['image_url'], picture.value);
  }
};

// remove slashes from end of URL (necessary only when running RegExp.exec)
const removeSlashes = (url) => {
  let urlTrimmed = url;
  while (urlTrimmed.endsWith('/')) {
    urlTrimmed = urlTrimmed.substring(0, urlTrimmed.length - 1);
  }
  return urlTrimmed;
};

// format markdown value
const formatMarkdownValue = (value) => {
  const uriSegmentPattern = /([\w\.\-]+$)/;
  const valueTrimmed = removeSlashes(value);
  const result = urlVal.isWebUri(value) ? `<${value}|${uriSegmentPattern.exec(valueTrimmed)[1]}>` : value;
  return result;
};

// process RDF node until we reach value
const serializeRdfNode = (node) => {
  let result;
  if (node.value) {
    return node.value;
  }
  if (node.elements) {
    const elements = node.elements;
    result = '[';
    for (let i = 0; i < elements.length; i++) {
      result += '\n  ';
      const element = elements[i];
      result += serializeRdfNode(element);
      if (i === elements.length - 1) {
        result += '\n]';
      } else {
        result += ',';
      }
    }
    return result;
  }
};

// prepare RDF node for display
const displayRdfNode = (node) => {
  let result = serializeRdfNode(node);
  result = formatMarkdownValue(result);
  return result;
};

// create block from RDF statement
const makeRdfBlock = (statement, index) => {
  console.log(`making rdf block ${index}...`);
  const sub = displayRdfNode(statement.subject);
  const pred = displayRdfNode(statement.predicate);
  const obj = displayRdfNode(statement.object);
  const mrkdwn = `${index}. ${sub} ${pred} ${obj}`
  console.log(`finished rdf block ${index}`);
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": mrkdwn
    }
  };
}; 

// convert RDF statements to blocks
const convertRdfToBlocks = (statements) => {
  console.log(`converting rdf to blocks...`);
  const blocks = [];
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const block = makeRdfBlock(statement, i);
    blocks.push(block);
  }
  return blocks;
};

// add RDF statement blocks
const addRdfBlocks = (viewConfig, statements) => {
  console.log('adding rdf statement blocks...');
  const rdfBlocks = convertRdfToBlocks(statements);
  viewConfig.blocks = viewConfig.blocks.concat(rdfBlocks);
  console.log('viewConfig.blocks:', viewConfig.blocks);
};

module.exports = {
  getInputValueFromSubmission,
  getBlockById,
  getBlockFieldValue,
  setBlockFieldValue,
  customizeProfile,
  addRdfBlocks,
};
