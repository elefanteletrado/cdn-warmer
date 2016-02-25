'use strict';

const Warmer = require('../index.js');

const BASE_PATH = '/content';
const CDN_PREFIX = 'mycdn.cloudfront.com/content';

describe('Warmer', () => {
  let warmer;

  beforeEach(() => {
    warmer = new Warmer(CDN_PREFIX, BASE_PATH);
  });

  describe('buildFileUrl', () => {

  });
});
