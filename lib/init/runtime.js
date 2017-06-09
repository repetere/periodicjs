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
function setAppRunningEnv(env, operation, processRuntimeConfig, argv = {}) {
  // console.log({ env, operation, processRuntimeConfig })
  const processEnv = {
    process: {
      runtime: env,
    },
  };
  const configProcessEnv = Object.assign({}, processEnv);
  configProcessEnv.process = Object.assign({}, configProcessEnv.process, {
    cli: (argv.cli) ? true : false,
    argv,
  });
  const processConfig = {
    filepath: 'content/config/process/runtime.json', // environment: String,  // container: String,
    config: processEnv,
  };
  this.config = Object.assign({}, this.config, configProcessEnv);
  if (argv.debug) {
    this.config.debug = (argv.debug === false || argv.debug === 'false') ? false : argv.debug;
  }
  // console.log('this.config', this.config);
  if (operation === 'update') {
    const updateDoc = Object.assign({}, processRuntimeConfig, processConfig);
    // console.log({ updateDoc });
    return this.configuration.update({ updatedoc: updateDoc, });
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
      // console.log('process.argv', process.argv);
      // console.log('configRuntimeEnvironment this.config', this.config);
      const argv = require('minimist')(process.argv.slice(2));
      const appEnv = this.config.environment || getEnv(argv);
      let existingRuntimeEnv;
      // if (this.config.configuration.type === 'db') {
      this.configuration.load({ docid: 'filepath', query: 'content/config/process/runtime.json' })
        .then(result => {
          try {
            existingRuntimeEnv = result.config.process.runtime;
          } catch (e) {
            existingRuntimeEnv = false;
          }
          // console.log({ result,appEnv,existingRuntimeEnv });
          if (!result && !appEnv && !existingRuntimeEnv) {
            throw new Error('A valid runtime environment is required');
          }
          if (result) {
            if (result.toJSON && typeof result.toJSON === 'function') {
              result = result.toJSON();
            }
            if (existingRuntimeEnv === appEnv) {
              resolve(setAppEnv(appEnv, undefined, undefined, argv));
            } else {
              resolve(setAppEnv(appEnv || existingRuntimeEnv, 'update', result, argv));
            }
          } else {
            resolve(setAppEnv(appEnv, 'create', undefined, argv));
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

function completeInitialization(resolve, reject, e) {
  if (e.message === 'Leave Promise Chain: CLI Process' ||
    e.message === 'Leave Promise Chain: Forking Process') {
    this.logger.info(e.message);
    resolve(true);
  } else {
    this.logger.error('Could not initialize Periodic');
    reject(e);
  }
}

module.exports = {
  configRuntimeEnvironment,
  getEnv,
  setAppRunningEnv,
  completeInitialization,
};