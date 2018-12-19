require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require("aws-sdk");

const { BUCKET_REGION, BUCKET_NAME } = process.env;
const s3 = new AWS.S3({
  region: BUCKET_REGION,
  signatureVersion: 'v4',
});

const app = express();

// parse body params and attach them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app
  // Pre-flight request
  .options('/put-object-urls', (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set("Access-Control-Allow-Headers", "Content-Type");
    next()
  })
  .post('/put-object-urls', (req, res) => {
    // We may set `Expire` for security reason
    // Need to be careful if we get object key from user
    const params = { Bucket: BUCKET_NAME, Key: 'poc/signed-put-object', Expires: 600 };
    s3.getSignedUrl(
      'putObject',
      params,
      (err, url) => {
        res
          .set('Access-Control-Allow-Origin', '*')
          .json({ url });
      }
    );
  });

app.listen(
  3001,
  () => console.log('Server started'),
);
