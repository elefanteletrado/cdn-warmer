'use strict';

const expect = require('chai').expect;
const util = require('../util.js');

describe('util', () => {
  describe('getSizeOf', () => {
    it('should return undefined if the value provided is not a string', () => {
      let actual = util.getSizeOf(1);

      expect(actual).to.be.undefined;
    });

    it('should return the size of a string in bytes', () => {
      let actual = util.getSizeOf('abc');

      expect(actual).to.equal(3);
    });

    it('should return 0 for empty strings', () => {
      let actual = util.getSizeOf('');

      expect(actual).to.equal(0);
    });
  });

  describe('calcRate', () => {
    it('should calculate the right percentage of a given base number (total) and a quantity', () => {
      let actual = util.calcRate(10, 5);

      expect(actual).to.equal('50.00');
    });

    it('should have as many precision digits as provided', () => {
      let actual = util.calcRate(10, 5, 5);
      let decimals = actual.toString().split('.')[1];

      expect(decimals).to.have.length(5);
    });

    it('should use 2 decimal numbers as precision if none is provided', () => {
      let actual = util.calcRate(100, 20);
      let decimals = actual.toString().split('.')[1];

      expect(decimals).to.have.length(2);
    });
  });
});
