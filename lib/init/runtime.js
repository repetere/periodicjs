'use strict';
// const path = require('path');
// const fs = require('fs-extra');
const minimist = require('minimist');

/**
 * get the application environment from command line arguments
 * 
 * @param {any} argv parsed command line arguments
 * @returns {string|boolean} returns the value of the enviroment or false
 */
function getEnv(argv) {
  // console.log('typeof argv._', typeof argv._);
  // console.log('argv._.length', argv._.length);
  // console.log('process.env', process.env);
  if (argv.e) {
    return argv.e;
  } else if (argv._.length === 1) {
    return argv._[0];
  } else if (process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  } else if (process.env.ENV) {
    return process.env.ENV;
  } else {
    return false;
  }
};

/**
 * sets the application runtime environment and save last run environment into configuration
 * 
 * @param {any} env 
 */
function setAppRunningEnv(env, operation) {
  this.config = Object.assign(this.config, {
    process: {
      runtime: env,
    },
  });
  if (operation === 'update') {
    return this.configuration.update()
  } else if (operation === 'create') {
    return this.configuration.create()
  } else return false;
}

/**
 * sets the runtime environment correctly
 * 
 * @returns {Promise} configRuntimeEnvironment sets up application config db
 */
function configRuntimeEnvironment() {
  const setAppEnv = setAppRunningEnv.bind(this);
  // const __CONFIG_DIR = path.resolve(this.config.app_root, 'content/config');
  // const __CONFIG_JSON_PATH = path.join(__CONFIG_DIR, 'config.json');

  return new Promise((resolve, reject) => {
    try {
      const argv = require('minimist')(process.argv.slice(2));
      const appEnv = getEnv(argv);
      // if (this.config.configuration.type === 'db') {
      // console.log('this.configuration', this.configuration);
      this.configuration.load({ docid: 'filepath', query: 'content/config/process/runtime.json' })
        .then(result => {
          if (!result.environment && !result && !argv) {
            throw new Error('A valid runtime environment is required');
          }
          if (result) {
            resolve(setAppEnv(result.environment, 'update'));
          } else {
            resolve(setAppEnv(appEnv, 'create'));
          }
          // console.log({ result });
        })
        .catch(reject);
      // } else { //eventually handle files again
      // }
    } catch (e) {
      reject(e);
    }
  })
}
module.exports = {
  configRuntimeEnvironment,
  getEnv,
  setAppRunningEnv,
};