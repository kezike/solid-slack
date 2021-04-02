const urlVal = require('valid-url');

/* === BEGIN GENERAL === */

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

// remove slashes from end of URL (necessary only when running RegExp.exec)
const removeSlashes = (url) => {
  let urlTrimmed = url;
  while (urlTrimmed.endsWith('/')) {
    urlTrimmed = urlTrimmed.substring(0, urlTrimmed.length - 1);
  }
  return urlTrimmed;
};

// create divider block
const makeDividerBlock = () => {
  return {
    "type": "divider"
  };
};

// create text block
const makeTextBlock = (text) => {
  return {
    "type": "section",
    "text": {
      "type": "plain_text",
      "text": text,
      "emoji": true
    }
  };
};

// create back block
const makeImageBlock = (url, title='') => {
  title = title ? title : url.split('/').pop();
  return {
    {
      "type": "image",
      "image_url": url,
      "title": {
        "type": "plain_text",
        "text": title
      }
    }
  };
};

// create back block
const makeBackBlock = () => {
  return {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": ":back:",
          "emoji": true
        },
        "value": "load-previous",
        "action_id": "load-previous"
      }
    ]
  };
};

/* === END GENERAL === */

/* === BEGIN FILE === */

// add RDF file blocks
const addFileBlocks = (viewConfig, content, type, url) => {
  const backBlock = makeBackBlock();
  const dividerBlock = makeDividerBlock();
  viewConfig.blocks.push(backBlock);
  viewConfig.blocks.push(dividerBlock);
  const chunkSize = 3000;
  const chunkPattern = new RegExp(`.{1,${chunkSize}}`,'g');
  const baseType = type.split('/').shift();
  switch (baseType) {
    case 'image':
      const imageBlock = makeImageBlock(url);
      viewConfig.blocks.push(imageBlock);
      return;
    case 'text':
    default:
      if (content.length > chunkSize) {
        const chunks = content.match(chunkPattern);
        const chunkBlocks = chunks.map((chunk) => {
          return makeTextBlock(chunk);
        });
        viewConfig.blocks = viewConfig.blocks.concat(chunkBlocks);
      } else {
        const textBlock = makeTextBlock(content);
        viewConfig.blocks.push(textBlock);
      }
  }
};

/* === END FILE === */

/* === BEGIN PROFILE === */

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

/* === END PROFILE === */

/* === BEGIN CONTAINER === */

// create block from RDF container statement
const makeContainerBlock = (statement, index) => {
  const sub = statement.subject.value;
  // const pred = statement.predicate.value;
  const obj = statement.object.value;
  // const coreId = `${sub}_${pred}_${obj}_${index}`;
  // const actionId = `account_item_action_id_${coreId}`;
  const objRelPath = obj.split(sub)[1];
  return {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": objRelPath
        },
        "value": obj,
        "action_id": "load-content"
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

// convert RDF container statements to blocks
const convertContainerRdfToBlocks = (statements) => {
  const blocks = [];
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const block = makeContainerBlock(statement, i);
    blocks.push(block);
  }
  return blocks;
};

// add RDF container statement blocks
const addContainerBlocks = (viewConfig, statements, back=false) => {
  if (back) {
    const backBlock = makeBackBlock();
    viewConfig.blocks.push(backBlock);
  }
  const accountBlocks = convertContainerRdfToBlocks(statements);
  for (let i = 0; i < accountBlocks.length; i++) {
    const accountBlock = accountBlocks[i];
    const dividerBlock = makeDividerBlock();
    viewConfig.blocks.push(accountBlock);
    viewConfig.blocks.push(dividerBlock);
  }
};

/* === END CONTAINER === */

module.exports = {
  getInputValueFromSubmission,
  getBlockById,
  getBlockFieldValue,
  setBlockFieldValue,
  customizeProfile,
  addFileBlocks,
  addProfileBlocks,
  addContainerBlocks,
};
