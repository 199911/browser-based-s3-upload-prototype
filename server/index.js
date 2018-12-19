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

// S3 put object
app
  // Pre-flight request
  .options('/put-object-urls', (req, res, next) => {
    res
      .set('Access-Control-Allow-Origin', '*')
      .set("Access-Control-Allow-Headers", "Content-Type")
      .end();
  })
  .post('/put-object-urls', (req, res) => {
    // We may set `Expire` for security reason
    // Need to be careful if we get object key from user
    const params = { Bucket: BUCKET_NAME, Key: 'poc/signed-put-object', Expires: 5 };
    s3.getSignedUrl(
      'putObject',
      params,
      (err, url) => {
        if (err) {
          console.log(err);
        }
        res
          .set('Access-Control-Allow-Origin', '*')
          .json({ url });
      }
    );
  });

// S3 multipart upload
app
  // Pre-flight request
  .options('/uploads(/*)?', (req, res, next) => {
    res
      .set('Access-Control-Allow-Origin', '*')
      .set("Access-Control-Allow-Headers", "Content-Type")
      .end();
  })
  // Create multipart upload
  .post('/uploads', async (req, res) => {
    const multipart = await s3
      .createMultipartUpload({
        Bucket: BUCKET_NAME,
        Key: 'poc/signed-multipart-upload',
        // The expires field do nothing about multipart abort
        // We need to set up Aborting Incomplete Multipart Uploads Bucket Lifecycle Policy
        // https://github.com/aws/aws-sdk-js/issues/1959
        Expires: 60
      })
      .promise();
    res
      .set('Access-Control-Allow-Origin', '*')
      .json(multipart);
  });

app.listen(
  3001,
  () => console.log('Server started'),
);
