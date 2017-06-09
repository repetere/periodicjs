'use strict';
const periodic = require('periodicjs');

module.exports = {
  hello: (options) => {
    periodic.logger.silly('hello',{options});
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
}