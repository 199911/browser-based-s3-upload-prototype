require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require("aws-sdk");

const { BUCKET_REGION, BUCKET_NAME } = process.env;
const s3 = new AWS.S3({
  region: BUCKET_REGION,
});

const app = express();

// parse body params and attach them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/put-object-urls', (req, res) => {
  // We may set `Expire` for security reason
  const params = { Bucket: BUCKET_NAME, Key: 'signed-put-object', Expires: 60 };
  s3.getSignedUrl(
    'putObject',
    params,
    (err, url) => {
      res.json({ url });
    }
  );
});

app.listen(
  3001,
  () => console.log('Server started'),
);
