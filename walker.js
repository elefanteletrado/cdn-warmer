'use strict';

const Q = require('q');
const path = require('path');
const walk = require('walk');

module.exports.walk = (baseDirectory) => {
  let deferred = Q.defer();
  let walker = walk.walk(baseDirectory);
  let file;
  let files = [];

  walker.on('file', (root, fileStats, next) => {
    file = path.resolve(root, fileStats.name);
    files.push(file);
    next();
  });

  walker.on('end', () => {
    deferred.resolve(files);
  });

  return deferred.promise;
};
