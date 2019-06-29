// const moment = require('moment')

module.exports = (req, res) => {
  // const currentTime = moment().format('MMMM Do YYYY, h:mm:ss a')
  const weather = {
      "response_type": "in_channel",
      "text": "It's 80 degrees right now.",
      "attachments": [
        {
          "text":"Partly cloudy today and tomorrow"
        }
      ]
  };
  res.json(weather);
}
