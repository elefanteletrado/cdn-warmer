'use strict';

const ProgressBar = require('progress');
const spinner = require('simple-spinner');

module.exports.getSizeOf = (value) => {
  if (typeof value === 'string') {
    return Buffer.byteLength(value, 'utf8');
  }

  return;
};

module.exports.log = (text, ignoreVerbosity) => {
  if (isVerbose() || ignoreVerbosity === true) {
    console.log(text);
  }
};

module.exports.calcRate = (base, number, precision) => {
  precision = precision || 2;

  if (base === 0) {
    return 0;
  }

  return ((number * 100) / base).toFixed(precision);
};

module.exports.progressBar = (template, total, length) => {
  length = length || 20;
  let bar;

  if (isVerbose()) {
    let barTemplate = template;

    let barOptions = {
      complete: '=',
      incomplete: ' ',
      width: length,
      total: total
    };

    bar = new ProgressBar(barTemplate, barOptions);
  }

  return bar;
};

module.exports.spinner = {
  start: () => {
    if (isVerbose()) {
      spinner.start();
    }
  },
  stop: () => {
    if (isVerbose()) {
      spinner.stop();
    }
  }
};

const isVerbose = () => {
  return process.env.verbose == 'true';
}
