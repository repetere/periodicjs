'use strict';
const https = require('https');
const path = require('path');
const fs = require('fs-extra');
const cluster = require('cluster');
const os = require('os');

function run() {
  return new Promise((resolve, reject) => {
    try {
      if (this.config.cli || this.config.process.cli) {
        reject(new Error('Leave Promise Chain: CLI Process'));
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  run,
};