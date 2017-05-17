'use strict';
const https = require('https');
const path = require('path');
const repl = require('repl');
const fs = require('fs-extra');
const cluster = require('cluster');
const os = require('os');

function processArgv(options) {
  const crudProcess = options.process || process;
  try {
    if (options.argv.crud) {
      this.crud[ options.argv.crud ][ options.argv.crud_op ](options.argv.crud_arg)
        .then(result => {
          this.logger.info(`CLI crud:${options.argv.crud} op:${options.argv.crud_op}, successful.`);
          if (options.argv.crud_debug || this.config.debug) {
            this.logger.debug('CLI crud arguments arg:', options.argv.crud_arg);
            this.logger.debug('CLI crud process result:', result);
          }
          crudProcess.exit();
        }).catch(e => {
          this.logger.error(e);
          crudProcess.exit();
        });
    } else if (options.argv.repl) {
      repl.start('$p > ').context.$p = this;
    }
  } catch (e) {
    this.logger.error('CLI PROCESS ERROR:', e);
    crudProcess.exit();
  }
}

function run() {
  return new Promise((resolve, reject) => {
    try {
      if (this.config.cli || this.config.process.cli) {
        reject(new Error('Leave Promise Chain: CLI Process'));
        processArgv.call(this, { argv: this.config.process.argv });
        // console.log('this will run after process rejects',this.config);
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
  processArgv,
};