'use strict';
const Promisie = require('promisie');
const path = require('path');
const fs = Promisie.promisifyAll(require('fs-extra'));
const __STRUCTURE_DIR = path.resolve(__dirname, '../../__STRUCTURE');

/**
 * Starts intialization console timer
 * 
 * @returns Promise
 */
function startTimer() {
  return new Promise((resolve, reject) => {
    try {
      this.config.time_start = new Date().valueOf();
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Ends initialization console timer
 * 
 * @returns Promise
 */
function endTimer() {
  return new Promise((resolve, reject) => {
    try {
      this.config.time_end = new Date().valueOf();
      this.logger.info(`Initialized Periodic in ${((this.config.time_end-this.config.time_start) / 1000).toFixed(2)} seconds`)
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * exports console timing functions
 */
module.exports = {
  startTimer,
  endTimer,
};