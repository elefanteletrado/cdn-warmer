'use strict';

const File = require('./file.js');
const Q = require('q');
const path = require('path');
const perfy = require('perfy');
const request = require('request');
const url = require('url');
const util = require('./util.js');

const getFile = (url) => {
  let deferred = Q.defer(),
  options = {
    url: url,
    headers: {
      'User-Agent': 'cdn-warmer'
    }
  };

  perfy.start(url);

  request(options, (error, response, body) => {
    let file = new File(url);

    // Set file status
    if (response) {
      file.status = response.statusCode; // HTTP status code
      file.cache = response.headers['x-cache']; // Hit or miss
    }

    file.time = perfy.end(url).time; // in seconds

    if (error) {
      file.error = error;
    } else {
      file.size = util.getSizeOf(body); // File size in bytes
    }

    deferred.resolve(file);
  });

  return deferred.promise;
};

const getFiles = (urls, onFile) => {
  let promise,
  promises = [];

  urls.forEach((url) => {
    promise = getFile(url);

    promise.then((file) => {
      if (typeof onFile === 'function') {
        onFile(file);
      }
    })

    promises.push(promise);
  });

  return Q.allSettled(promises);
};

module.exports.get = (url, onFile) => {
  if (typeof url === 'string') {
    return getFile(url);
  } else {
    return getFiles(url, onFile);
  }
};

module.exports.buildFileUrl = (cdnPrefix, file) => {
  let baseDirName = path.parse(process.cwd()).base;
  let index = file.indexOf(baseDirName);
  let filePath = file.substr(index);

  return url.resolve(cdnPrefix, filePath);
};
