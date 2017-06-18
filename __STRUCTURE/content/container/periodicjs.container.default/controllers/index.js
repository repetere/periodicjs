'use strict';
const periodic = require('periodicjs');

module.exports = {
  test: (req, res, next) => {
    periodic.logger.silly('test middleware');
    next();
  }
}