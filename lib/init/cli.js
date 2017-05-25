'use strict';
const https = require('https');
const path = require('path');
const repl = require('repl');
const fs = require('fs-extra');
const cluster = require('cluster');
const os = require('os');
const periodicInitTimer = require('./consoleTimer');

function processArgv(options) {
  const crudProcess = options.process || process;
  try {
    if (options.argv.status) {
      this.logger.info('Periodic Application Status');
    } else if (options.argv.crud) {
      this.crud[options.argv.crud][options.argv.crud_op](options.argv.crud_arg)
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
      const r = repl.start('$p > ');
      r.context.$p = this;
      setTimeout(() => {
        crudProcess.stdout.write('\r\n$p > Periodic is mounted on \'$p\' \r\n$p >');
      }, 1000);
      // console.log('r.context',r.context)
      // Object.defineProperties(r.context, '$p', {
      //   configurable: false,
      //   enumerable: true,
      //   // writable:false,
      //   // value: self,
      // });
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
        periodicInitTimer.endTimer.call(this).then(() => { }).catch(this.logger.error);
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