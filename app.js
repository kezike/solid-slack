require('dotenv').config({ silent: true });
let express = require("express");
let app = express();
const port = process.env.PORT || 3009;
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
const validator = require('express-validator');
const http = require("http").Server(app);
const io = require('socket.io')(http);

dotenv.config();

app.disable('x-powered-by');

app.use(logger("dev"));
/*app.use(bodyParser.json({
  verify: (req, res, buf) => {
    let url = req.originalUrl;
  }
}));*/
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

/*app.use(validator({
  customValidators: {
    isArray: function (value) {
      return Array.isArray(value);
    },
    notEmpty: function (array) {
      return array.length > 0;
    },
    gte: function (param, num) {
      return param >= num;
    }
  }
}));*/

app.use(function (req, res, next) {
  req.io = io;
  next();
});

require("./routes")(app);

http.listen(port, function () {
  console.log("listening on port " + port);
});

module.exports = app;
