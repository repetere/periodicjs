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
  if (!argv && !process.env.NODE_ENV && !process.env.ENV) {
    return false;
  } else if (argv && argv.e) {
    return argv.e;
  } else if (argv && argv._ && argv._.length === 1) {
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
 * @param {any} env this is the enviroment variable to set
 * @param {string} operation either update the config db, or create a new entry for process.runtime
 * @param {object} processRuntimeConfig existing runtime config from configuration database
 * @returns {boolean|Promise} returns a resolved promise after configuration database operation
 */
function setAppRunningEnv(env, operation, processRuntimeConfig) {
  const processEnv = {
    process: {
      runtime: env,
    },
  };
  const processConfig = {
    filepath: 'content/config/process/runtime.json', // environment: String,  // container: String,
    config: processEnv,
  };
  this.config = Object.assign(this.config, processEnv);
  if (operation === 'update') {
    return this.configuration.update({ updatedoc: Object.assign({}, processRuntimeConfig, processConfig) });
  } else if (operation === 'create') {
    return this.configuration.create({
      newdoc: processConfig
    });
  } else return false;
}

/**
 * sets the runtime environment correctly
 * 
 * @returns {Promise} configRuntimeEnvironment sets up application config db
 */
function configRuntimeEnvironment() {
  const setAppEnv = setAppRunningEnv.bind(this);
  return new Promise((resolve, reject) => {
    try {
      const argv = require('minimist')(process.argv.slice(2));
      const appEnv = getEnv(argv);
      let existingRuntimeEnv;
      // if (this.config.configuration.type === 'db') {
      this.configuration.load({ docid: 'filepath', query: 'content/config/process/runtime.json' })
        .then(result => {
          try {
            existingRuntimeEnv = result.config.process.runtime;
          } catch (e) {
            existingRuntimeEnv = false;
          }
          if (!result && !argv && !existingRuntimeEnv) {
            throw new Error('A valid runtime environment is required');
          }
          if (result) {
            if (existingRuntimeEnv === appEnv) {
              resolve(true);
            } else {
              resolve(setAppEnv(appEnv || existingRuntimeEnv, 'update', result));
            }
          } else {
            resolve(setAppEnv(appEnv, 'create'));
          }
        })
        .catch(reject);
      // } else { //eventually handle files again
      // const __CONFIG_DIR = path.resolve(this.config.app_root, 'content/config');
      // const __CONFIG_JSON_PATH = path.join(__CONFIG_DIR, 'config.json');
      // }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports = {
  configRuntimeEnvironment,
  getEnv,
  setAppRunningEnv,
};