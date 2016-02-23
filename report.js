'use strict';

const util = require('./util.js');

class Report {
  constructor() {
    this.baseDirectory = null;
    this.started = null;
    this.ended = null;
    this.errors = [];
    this.cdn = null;
    this.files = [];
    this.hits = 0;
    this.misses = 0;
  }

  get elapsedTime() {
    if (this.started && this.ended) {
      return ((this.ended - this.started) / 1000).toFixed(2);
    }

    return 0;
  }

  get errorRate() {
    return util.calcRate(this.files.length, this.errors.length);
  }

  get hitRate() {
    return util.calcRate(this.files.length, this.hits);
  }

  get missRate() {
    return util.calcRate(this.files.length, this.misses);
  }

  error(error) {
    errors.push(error);
  }

  hit() {
    this.hits++;
  }

  miss() {
    this.misses++;
  }

  start() {
    if (this.started === null) {
      this.started = new Date();
    }
  }

  end() {
    if (this.ended === null) {
      this.ended = new Date();
    }
  }
}

module.exports = Report;
