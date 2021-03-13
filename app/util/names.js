// extract submitted value from modal input id
const getInputValueFromSubmission = (submission, id) => {
  const values = submission.view.state.values;
  const blockId = `${id}_block`;
  const inputId = `${id}_input`;
  return values[blockId][inputId].value;
}

module.exports = { getInputValueFromSubmission };
