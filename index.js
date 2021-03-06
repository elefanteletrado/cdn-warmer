'use strict';

const _ = require('lodash');
const Report = require('./report.js');
const Q = require('q');
const colors = require('colors');
const merge = require('merge');
const http = require('./http.js');
const util = require('./util.js');
const walker = require('./walker');
const url = require('url');

class Warmer {
  constructor(cdn, bucket, prefix, options) {
    let defaults = {
      chunkSize: 200
    };

    this.cdn = cdn;
    this.bucket = bucket;
    this.prefix = prefix;

    options = options || {};
    this.options = merge(defaults, options);
  }

  warm(callback) {
    util.log(`Looking for files on ${this.bucket.white.bold}...`);

    let report = new Report();
    report.cdn = this.cdn;
    report.bucket = this.bucket;
    report.prefix = this.prefix;
    report.start();

    util.spinner.start();

    // Get all files from base directory recursively
    walker.walk(this.bucket, this.prefix)
      .then((files) => {
        util.spinner.stop();
        
        let deferred = Q.defer();
        let results = [];

        util.log(`${files.length} files found.`);
        util.log(`Warming up CDN at ${this.cdn.bold}...`);

        // Setup progress bar
        let barTemplate = 'Getting files [:bar] :percent (:current/:total)';
        let progressBar = util.progressBar(barTemplate, files.length);

        // Build URL list
        let urls = files.map((file) => {
          return url.resolve(this.cdn, file);
        });

        // Break up URLs into chunks
        let chunks = _.chunk(urls, this.options.chunkSize);
        let chunk = chunks.pop();

        // Callback executed when a file is downloaded. Updates the progress bar
        // and accounts the hits or misses
        let onFileCallback = onFile(report, progressBar);

        // This callback is executed when a chunk of URLs are finished. It will
        // keep firing up http.get until no chunks are left
        let onChunkCallback = onChunk(results, chunks, deferred, onFileCallback);

        http.get(chunk, onFileCallback).then(onChunkCallback);

        return deferred.promise;
      })
      .then(onSuccess(report, callback), onError(report, callback));
  }
}

const onFile = (report, progressBar) => {
  return (file) => {
    if (progressBar) {
      progressBar.tick();
    }

    // Check if it was a hit or miss on CDN
    let isHit = file.cache === 'Hit from cloudfront';

    // Increase counter for hits/misses
    isHit ? report.hit() : report.miss();
  };
}

const onChunk = (results, chunks, deferred, onFile) => {
  return (result) => {
    result = result.map((item) => {
      return item.value;
    });

    results = results.concat(result);

    // Check if there is still work to do
    if (chunks.length > 0) {
      let chunk = chunks.pop();

      http.get(chunk, onFile)
        .then(onChunk(results, chunks, deferred, onFile));
    } else {
      deferred.resolve(results);
    }
  };
};

const onSuccess = (report, callback) => {
  return (results) => {
    report.end();

    // Append results to report
    results.forEach((result) => {
      report.files.push(result);

      if (result.error) {
        report.error(result.error);
      }
    });

    if (typeof callback === 'function') {
      callback(null, report);
    }
  };
};

const onError = (report, callback) => {
  return (error) => {
    report.error = error;
    report.end();

    if (typeof callback === 'function') {
      callback(error, report);
    }
  };
};

module.exports = Warmer;
