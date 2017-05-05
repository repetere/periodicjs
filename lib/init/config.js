'use strict';
const path = require('path');
const fs = require('fs-extra');

function configureLowkie() {
  console.log('config lowkie this', this);

  return new Promise((resolve, reject) => {
    try {
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * reads content/config/config.json for configurationg database
 * 
 * @returns Promise loadConfiguration sets up application config db
 */
function loadConfiguration() {
  const __CONFIG_DIR = path.resolve(this.config.app_root, 'content/config');
  const __CONFIG_JSON_PATH = path.join(__CONFIG_DIR, 'config.json');

  return new Promise((resolve, reject) => {
    try {
      // resolve(this);
      fs.readJson(__CONFIG_JSON_PATH)
        .then(app_configuration_settings => {
          this.config.configuration = app_configuration_settings.configuration;
          return configureLowkie.call(this);
          // console.log({ app_configuration_settings });
          // resolve(app_configuration_settings);
        })
        .then(configdb => {
          resolve(configdb);
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  })
}
module.exports = loadConfiguration;