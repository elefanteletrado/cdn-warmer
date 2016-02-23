'use strict';

module.exports.getSizeOf = (value) => {
  if (typeof value === 'string') {
    return Buffer.byteLength(value, 'utf8');
  }

  return;
};

module.exports.log = (text, ignoreVerbosity) => {
  if (process.env.verbose === 'true' || ignoreVerbosity === true) {
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
