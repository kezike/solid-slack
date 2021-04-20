const urlVal = require('valid-url');
const { FILE_SIZE_LIMIT, VIEW_STACK_LIMIT } = require('./slack');

/* === BEGIN GENERAL === */

// Extract submitted value from modal input id
const getInputValueFromPayload = (payload, id) => {
  const view = payload.view;
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
const getFieldValue = (block, path) => {
  let scope = block;
  for (let i = 0; i < path.length; i++) {
    const field = path[i];
    scope = scope[field];
  }
  return scope;
};

// Set value of block field at nested path
const setFieldValue = (block, path, value) => {
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

// create divider block
const makeDividerBlock = () => {
  return {
    "type": "divider"
  };
};

// create text block
const makeTextBlock = (text, options={}) => {
  const type = options.type ? options.type : 'plain_text';
  const blockId = options.blockId;
  let textBlock = {
    "type": "section",
    "text": {
      "type": type,
      "text": text,
      "emoji": true
    }
  };
  textBlock = Object.assign(
    textBlock,
    blockId && { "block_id": blockId }
  );
  return textBlock;
};

// create image block
const makeImageBlock = (url, title='') => {
  title = title ? title : url.split('/').pop();
  const altText = `image at ${url}`;
  return {
    "type": "image",
    "image_url": url,
    "alt_text": altText,
    "title": {
      "type": "plain_text",
      "text": title
    }
  };
};

// create button block
const makeButtonBlock = (options={}) => {
  const text = options.text ? options.text : 'Click';
  const value = options.value ? options.value : 'button-value';
  const style = options.style;
  const actionId = options.actionId;
  let buttonBlockElement = {
    "type": "button",
    "text": {
      "type": "plain_text",
      "text": text,
      "emoji": true
    },
    "value": value,
  };
  buttonBlockElement = Object.assign(
    buttonBlockElement,
    style && { "style": style },
    actionId && { "action_id": actionId }
  );
  return {
    "type": "actions",
    "elements": [
      buttonBlockElement
    ]
  };
};

// create input block
const makeInputBlock = (options={}) => {
  const blockId = options.blockId;
  const actionId = options.actionId;
  const initialValue = options.initialValue ? options.initialValue : '';
  const multiline = options.multiline ? options.multiline : true;
  const optional = options.optional ? options.optional : true;
  const label = options.label ? options.label : 'Label';
  let inputElement = {
    "type": "plain_text_input",
    "multiline": multiline,
    "initial_value": initialValue
  };
  let inputBlock = {
    "type": "input",
    "label": {
      "type": "plain_text",
      "text": label,
      "emoji": true
    },
    "optional": optional
  };
  inputElement = Object.assign(
    inputElement,
    actionId && { "action_id": actionId }
  );
  inputBlock = Object.assign(
    inputBlock,
    blockId && { "block_id": blockId },
    inputElement && { "element": inputElement }
  );
  return inputBlock;
};

// remove slashes from end of URL (necessary only when running RegExp.exec)
const removeSlashes = (url) => {
  let urlTrimmed = url;
  while (urlTrimmed.endsWith('/')) {
    urlTrimmed = urlTrimmed.substring(0, urlTrimmed.length - 1);
  }
  return urlTrimmed;
};

/* === END GENERAL === */

/* === BEGIN FILE === */

// add file blocks
const addFileBlocks = (viewConfig, type, content, url) => {
  const baseType = type.split('/').shift();
  switch (baseType) {
    case 'image':
      const imageBlock = makeImageBlock(url);
      viewConfig.blocks.push(imageBlock);
      return;
    case 'text':
    default:
      const editButtonBlock = makeButtonBlock({
        text: ':lower_left_fountain_pen:   Edit',
        value: url,
        style: 'danger',
        actionId: 'edit-content'
      });
      const refreshButtonBlock = makeButtonBlock({
        text: ':arrows_counterclockwise:   Refresh',
        value: url,
        actionId: 'refresh-content'
      });
      const metadata = JSON.parse(viewConfig.private_metadata);
      const level = metadata.level;
      if (level === VIEW_STACK_LIMIT) {
        const warningBlock = makeTextBlock(`:warning: Note: Currently, Slack prevents navigation beyond ${VIEW_STACK_LIMIT} views, so we have sadly reached the end of the road :no_entry: Please continue this action at ${url} :warning:`);
        const dividerBlock = makeDividerBlock();
        viewConfig.blocks.push(warningBlock);
        viewConfig.blocks.push(dividerBlock);
      }
      viewConfig.blocks.push(editButtonBlock);
      viewConfig.blocks.push(refreshButtonBlock);
      if (content.length > FILE_SIZE_LIMIT) {
        const restrictionBlock = makeTextBlock(`:no_entry_sign: This file is too large to view in Slack. Please view it in a web browser at ${url} :no_entry_sign:`);
        viewConfig.blocks.push(restrictionBlock);
        return;
      }
      if (content.length === 0) {
        const emptyBlock = makeTextBlock(':no_entry_sign: This file is empty :no_entry_sign:', { blockId: `load_${url}` });
        viewConfig.blocks.push(emptyBlock);
        return;
      }
      const textBlock = makeTextBlock(content, { blockId: `load_${url}_block` });
      viewConfig.blocks.push(textBlock);
  }
};

// add edit file blocks
const addEditBlocks = (viewConfig, content, url) => {
  viewConfig.submit = {
    "type": "plain_text",
    "text": ":floppy_disk:   Save",
    "emoji": true
  };
  const editInputBlock = makeInputBlock({
    blockId: `save_${url}_block`,
    actionId: `save_${url}_input`,
    initialValue: content,
    label: 'Edit'
  });
  viewConfig.blocks.push(editInputBlock);
};

/* === END FILE === */

/* === BEGIN PROFILE === */

// Add profile picture to file viewer
const customizeProfile = (viewConfig, name, picture) => {
  const profileBlock = getBlockById(viewConfig, 'profile_picture');
  if (name) {
    setFieldValue(profileBlock, ['title', 'text'], name.value);
  }
  if (picture) {
    setFieldValue(profileBlock, ['image_url'], picture.value);
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
  const obj = statement.object.value;
  const objRelPath = obj.split(sub)[1];
  return {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": objRelPath,
          "emoji": true
        },
        "value": obj,
        "action_id": "load-content"
      }
    ]
  };
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
const addContainerBlocks = (viewConfig, statements, url) => {
  const metadata = JSON.parse(viewConfig.private_metadata);
  const level = metadata.level;
  if (level === VIEW_STACK_LIMIT) {
    const warningBlock = makeTextBlock(`:warning: Note: Currently, Slack prevents navigation beyond ${VIEW_STACK_LIMIT} views, so we have sadly reached the end of the road :no_entry: Please continue this action at ${url} :warning:`);
    const dividerBlock = makeDividerBlock();
    viewConfig.blocks.push(warningBlock);
    viewConfig.blocks.push(dividerBlock);
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
  getInputValueFromPayload,
  getBlockById,
  setFieldValue,
  customizeProfile,
  addFileBlocks,
  addEditBlocks,
  addProfileBlocks,
  addContainerBlocks,
};
