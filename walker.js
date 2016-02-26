'use strict';

const AWS = require('aws-sdk');
const Q = require('q');

const walk = (bucket, prefix) => {
  AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  AWS.config.secretAccessKey = process.env.SECRET_ACCESS_KEY;

  let deferred = Q.defer();
  let params = {
    Bucket: bucket, /* required */
    // Delimiter: 'STRING_VALUE',
    EncodingType: 'url',
    MaxKeys: 1000,
    Prefix: prefix
  };

  let results = [];

  let callback = (error, contents, isTruncated, nextMarker) => {
    if (error) console.log(error);

    let keys = contents.map((item) => {
      return item.Key;
    });

    results = results.concat(keys);

    if (isTruncated) {
      params.Marker = nextMarker;

      list(params, callback);
    } else {
      deferred.resolve(results);
    }
  };

  list(params, callback);

  return deferred.promise;
};

const list = (params, callback) => {
  let s3 = new AWS.S3();

  s3.listObjects(params, (error, data) => {
    if (error && typeof callback === 'function') {
      callback(error);
    } else if (typeof callback === 'function') {
      callback(null, data.Contents, data.IsTruncated, data.NextMarker);
    }
  });
};

module.exports.walk = walk;
