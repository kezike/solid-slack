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

// create block from RDF statement
const makeRdfBlock = (statement, index) => {
  console.log(`making rdf block ${index}...`);
  const sub = statement.subject.value;
  const pred = statement.predicate.value;
  const obj = statement.object.value;
  const pattPretty = /([\w\.\-]+$)/;
  const subPretty = pattPretty.exec(sub)[1];
  const predPretty = pattPretty.exec(pred)[1];
  const objPretty = pattPretty.exec(obj)[1];
  const mrkdwn = `${index}. <${sub}|${subPretty}> <${pred}|${predPretty}> <${obj}|${objPretty}>`
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
