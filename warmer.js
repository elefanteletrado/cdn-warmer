'use strict';

const File = require('./file.js');
const ProgressBar = require('progress');
const Report = require('./report.js');
const Q = require('q');
const colors = require('colors');
const path = require('path');
const perfy = require('perfy');
const request = require('request');
const url = require('url');
const util = require('./util.js');
const walker = require('./walker');

let report = null;

class Warmer {
  constructor(cdnPrefix, baseDirectory) {
    this.cdnPrefix = cdnPrefix;
    this.baseDirectory = baseDirectory;
  }

  /**
   * Builds the file URL using its name and the provided CDN prefix.
   */
  buildFileUrl(cdnPrefix, file) {
    let baseDirName = path.parse(process.cwd()).base;
    let index = file.indexOf(baseDirName);
    let filePath = file.substr(index);

    return url.resolve(cdnPrefix, filePath);
  };

  warm(callback) {
    util.log(`Looking for files on ${this.baseDirectory.white.bold}...`);

    report = new Report();
    report.cdn = this.cdnPrefix;
    report.baseDirectory = this.baseDirectory;
    report.start();

    // Get all files from base directory recursively
    walker.walk(this.baseDirectory)
      .then((files) => {
        util.log(`${files.length} files found.`);
        util.log(`Warming up CDN at ${this.cdnPrefix.bold}...`);

        let url = null;
        let promise = null;
        let promises = [];

        let bar = null;

        if (process.env.verbose == 'true') {
          let barTemplate =
            'Getting files [:bar] :percent (:current/:total)';

          let barOptions = {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: files.length
          };

          bar = new ProgressBar(barTemplate, barOptions);
        }

        files.forEach((file) => {
          url = this.buildFileUrl(this.cdnPrefix, file);
          promise = this.getFile(url);

          promise.then((file) => {
            if (bar) {
              bar.tick();
            }

            // Check if it was a hit or miss on CDN
            let isHit = file.cache === 'Hit from cloudfront';

            // Increase counter for hits/misses
            isHit ? report.hit() : report.miss();
          });

          promises.push(promise);
        });

        return Q.allSettled(promises);
      })
      .then((results) => {
        report.end();

        results.forEach((result) => {
          report.files.push(result.value);

          if (result.value.error) {
            report.error(result.value.error);
          }
        });

        if (typeof callback === 'function') {
          callback(null, report);
        }
      }, (error) => {
        report.error = error;
        report.end();

        if (typeof callback === 'function') {
          callback(error, report);
        }
      });
  }

  /**
   * Performs a HTTP GET request on the given URL.
   * @returns {Object} Returns a promise.
   */
  getFile(url) {
    let deferred = Q.defer();

    let options = {
      url: url,
      headers: {
        'User-Agent': 'cdn-warmer'
      }
    };

    perfy.start(url);

    request(options, (error, response, body) => {
      let file = new File(url);

      // Set file status
      file.status = response.statusCode; // HTTP status code
      file.time = perfy.end(url).time; // in seconds

      if (error) {
        file.error = error;
      } else {
        file.cache = response.headers['x-cache']; // Hit or miss
        file.size = util.getSizeOf(body); // File size in bytes
      }

      deferred.resolve(file);
    });

    return deferred.promise;
  };
}

module.exports = Warmer;
