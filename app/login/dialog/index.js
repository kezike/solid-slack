const bodyParser = require('body-parser');
const app = require('express')();
app.use(bodyParser.urlencoded({ extended: false }));
app.post('*', (req, res) => {
    // res.end("You have accessed the Solid Slack login dialog service.");
    res.json(req.body.payload);
});
app.listen();
