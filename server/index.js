const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse body params and attach them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(
  3001,
  () => console.log('Server started'),
);
