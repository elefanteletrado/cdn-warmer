'use strict';

class File {
  constructor(url) {
    this.cache = null;
    this.size = null;
    this.status = null;
    this.time = null;
    this.url = url;
  }
}

module.exports = File;
