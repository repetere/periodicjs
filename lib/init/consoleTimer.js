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
      console.time('Initializing Periodic');
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
      console.timeEnd('Initializing Periodic');
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