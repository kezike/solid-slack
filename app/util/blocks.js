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
  console.log('block before:', block);
  let scope = block;
  for (let i = 0; i < path.length; i++) {
    const field = path[i];
    if (i === path.length - 1) {
      scope[field] = value;
    } else {
      scope = scope[field];
    }
  }
  console.log('block after:', block);
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
const formatProfileMarkdownValue = (value) => {
  const uriSegmentPattern = /([\w\.\-]+$)/;
  const valueTrimmed = removeSlashes(value);
  const result = urlVal.isWebUri(value) ? `<${value}|${uriSegmentPattern.exec(valueTrimmed)[1]}>` : value;
  return result;
};

// process profile RDF node until we reach value
const serializeProfileRdfNode = (node) => {
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
      result += serializeProfileRdfNode(element);
      if (i === elements.length - 1) {
        result += '\n]';
      } else {
        result += ',';
      }
    }
    return result;
  }
};

// prepare profile RDF node for display
const displayProfileRdfNode = (node) => {
  let result = serializeProfileRdfNode(node);
  result = formatProfileMarkdownValue(result);
  return result;
};

// create block from profile RDF statement
const makeProfileBlock = (statement, index) => {
  const sub = displayProfileRdfNode(statement.subject);
  const pred = displayProfileRdfNode(statement.predicate);
  const obj = displayProfileRdfNode(statement.object);
  const mrkdwn = `${index + 1}. ${sub} ${pred} ${obj}`
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": mrkdwn
    }
  };
}; 

// convert profile RDF statements to blocks
const convertProfileRdfToBlocks = (statements) => {
  const blocks = [];
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const block = makeProfileBlock(statement, i);
    blocks.push(block);
  }
  return blocks;
};

// add profile RDF statement blocks
const addProfileBlocks = (viewConfig, statements) => {
  const profileBlocks = convertProfileRdfToBlocks(statements);
  viewConfig.blocks = viewConfig.blocks.concat(profileBlocks);
};

// create divider block
const makeDividerBlock = () => {
  return {
    "type": "divider"
  };
};

// create block from account RDF statement
const makeAccountBlock = (statement, index) => {
  const sub = statement.subject.value;
  // const pred = statement.predicate.value;
  const obj = statement.object.value;
  // const coreId = `${sub}_${pred}_${obj}_${index}`;
  // const value = `account_item_value_${coreId}`;
  // const actionId = `account_item_action_id_${coreId}`;
  const objRelPath = obj.split(sub)[1];
  console.log('RELATIVE PATH:', objRelPath);
  return {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": objRelPath
        },
        "value": value,
        "action_id": actionId
      }
    ]
  };
  /*return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `<${obj}|${objRelPath}>`
    }
  };*/
};

// convert account RDF statements to blocks
const convertAccountRdfToBlocks = (statements) => {
  const blocks = [];
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const block = makeAccountBlock(statement, i);
    blocks.push(block);
  }
  return blocks;
};

// add account RDF statement blocks
const addAccountBlocks = (viewConfig, statements) => {
  const accountBlocks = convertAccountRdfToBlocks(statements);
  for (let i = 0; i < accountBlocks.length; i++) {
    const accountBlock = accountBlocks[i];
    const dividerBlock = makeDividerBlock();
    viewConfig.blocks.push(accountBlock);
    viewConfig.blocks.push(dividerBlock);
  }
  console.log('FINAL BLOCKS:', viewConfig.blocks);
};

module.exports = {
  getInputValueFromSubmission,
  getBlockById,
  getBlockFieldValue,
  setBlockFieldValue,
  customizeProfile,
  addProfileBlocks,
  addAccountBlocks,
};
