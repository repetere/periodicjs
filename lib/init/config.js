'use strict';
const path = require('path');
const fs = require('fs-extra');
const lowkie = require('lowkie');
const mongoose = require('mongoose');
const defaultSettings = require('../defaults');
const configSchemas = require('../schemas');

/**
 * configureLowkie creates a loki connection to store DB based configurations
 * 
 * @returns {Promise} connects to configuration db
 */
function configureLowkie() {
  return new Promise((resolve, reject) => {
    try {
      const __CONFIG_DB = path.resolve(this.config.app_root, this.config.configuration.options.dbpath);

      lowkie.connect(__CONFIG_DB)
        .then((db) => {
          // console.log('connected db', db);
          if (this.config.debug) {
            this.logger.silly('LOWKIE: initialized configuration db');
          }
        })
        .catch(reject);
      lowkie.connection.on('connectionError', (e) => reject);
      lowkie.connection.on('connecting', (connectdata) => {
        if (this.config.debug) {
          this.logger.silly('LOWKIE: now trying to connect to configuration db');
        }
      });
      lowkie.connection.once('connected', (connectdata) => {
        if (this.config.debug) {
          this.logger.silly('LOWKIE: connected to configuration db', { connectdata });
        }
        const configurationModel = lowkie.model('configuration', configSchemas.lowkie);
        const CoreDataAdapter = this.core.data.create({
          adapter: 'loki',
          model: configurationModel,
        });
        this.dbs.set('configuration', lowkie);
        this.datas.set('configuration', CoreDataAdapter);

        // this.logger.silly({ __CONFIG_DB }, 'config lowkie this', this);
        resolve(true);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * configureMongoose creates a mongo connection to store DB based configurations
 * 
 * @returns {Promise} connects to configuration db
 */
function configureMongoose() {
  return new Promise((resolve, reject) => {
    try {
      //Basic usage (mongodb)
      const mongooseConfig = this.config.configuration.options;
      const configurationMongoose = mongoose.createConnection(mongooseConfig.url, mongooseConfig.mongoose_options);
      const configurationModel = configurationMongoose.model('configuration', configSchemas.mongoose);
      const CoreDataAdapter = this.core.data.create({ adapter: 'mongo', model: configurationModel });
      // console.log({ CoreDataAdapter, configurationMongoose });
      configurationMongoose.on('error', reject);
      configurationMongoose.on('connected', () => {
        // console.log('mongoose connected', mongooseConfig);
        this.datas.set('configuration', CoreDataAdapter);
        this.dbs.set('configuration', configurationMongoose);
        resolve(true);
      });
      // When the connection is disconnected
      configurationMongoose.on('disconnected', () => {
        this.logger.error('Mongoose default connection disconnected');
      });
      // If the Node process ends, close the Mongoose connection 
      process.on('SIGINT', function() {
        configurationMongoose.close(function() {
          this.logger.silly('Mongoose default connection disconnected through app termination');
          process.exit(0);
        });
      });
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
function loadConfiguration(customConfig) {

  return new Promise((resolve, reject) => {
    try {
      const __CONFIG_DIR = path.resolve(this.config.app_root, 'content/config');
      const __CONFIG_JSON_PATH = path.join(__CONFIG_DIR, 'config.json');
      // resolve(this);
      fs.readJson(__CONFIG_JSON_PATH)
        .then(app_configuration_settings => {
          this.config.configuration = customConfig ||  app_configuration_settings.configuration;
          this.settings = Object.assign({}, app_configuration_settings.settings);
          // console.log('this.config', this.config);
          if (this.config.configuration.type === 'db') {
            switch (this.config.configuration.db) {
              case 'lowkie':
                return configureLowkie.call(this);
              case 'mongoose':
                return configureMongoose.call(this);
              default:
                reject(new Error('invalid configuration db'));
                break;
            }
          } else {
            reject(new Error('invalid configuration type'));
          }
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

/**
 * loadAppSettings will configure periodic.settings by merging default settings, environment settings and override settings
 * default settings are in periodicjs/lib/defaults/environment.js
 * environment settings are set in the configuration db in content/config/environment/{name-of-env}.json
 * override settings are stored in content/config/config.json on the 'settings' property
 * 
 * @returns 
 */
function loadAppSettings() {
  const envConfigFilePath = `content/config/environment/${this.config.process.runtime}.json`;
  // load default settings
  // load environment settings
  // load override settings
  // assign to periodic.config.settings
  return new Promise((resolve, reject) => {
    try {
      this.configuration.load({
        docid: 'filepath',
        query: envConfigFilePath,
      }).then(envconfig => {
        const updatedSettings = Object.assign({}, defaultSettings.environment, envconfig, this.settings);
        this.settings = updatedSettings;
        resolve(updatedSettings);
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  configureLowkie,
  configureMongoose,
  loadConfiguration,
  loadAppSettings,
};