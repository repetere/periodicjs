'use strict';
const path = require('path');
const fs = require('fs-extra');
const lowkie = require('lowkie');
const mongoose = require('mongoose');
const Promisie = require('promisie');
const Sequelize = require('sequelize');
const defaultSettings = require('../defaults');
const schemas = require('../schemas');
const schemeDefaults = require('../defaults/schema');
mongoose.Promise = Promisie;

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
          const configurationModel = lowkie.model('configuration', schemas.config.lowkie);
          const extensionModel = lowkie.model('extension', schemas.extension.lowkie);
          const CoreConfigDataAdapter = this.core.data.create({
            adapter: 'loki',
            model: configurationModel,
          });
          const CoreExtensionDataAdapter = this.core.data.create({
            adapter: 'loki',
            model: extensionModel,
          });
          this.dbs.set('configuration', lowkie);
          this.datas.set('configuration', CoreConfigDataAdapter);
          this.datas.set('extension', CoreExtensionDataAdapter);
          resolve(true);
        })
        .catch(reject);
      lowkie.connection.on('connectionError', (e) => reject);
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
      const configurationModel = configurationMongoose.model('configuration', schemas.config.mongoose);
      const extensionModel = configurationMongoose.model('extension', schemas.extension.mongoose);
      const CoreConfigDataAdapter = this.core.data.create({ adapter: 'mongo', model: configurationModel });
      const CoreExtensionDataAdapter = this.core.data.create({ adapter: 'mongo', model: extensionModel });
      // console.log({ CoreConfigDataAdapter, configurationMongoose });
      configurationMongoose.on('error', reject);
      configurationMongoose.on('connected', () => {
        // console.log('mongoose connected', mongooseConfig);
        this.datas.set('configuration', CoreConfigDataAdapter);
        this.datas.set('extension', CoreExtensionDataAdapter);
        this.dbs.set('configuration', configurationMongoose);
        resolve(true);
      });
      // When the connection is disconnected
      configurationMongoose.on('disconnected', () => {
        this.logger.error('Mongoose default connection disconnected');
      });
      // // If the Node process ends, close the Mongoose connection 
      // process.on('SIGINT', () => {
      //   configurationMongoose.close(() =>{
      //     this.logger.silly('Mongoose default connection disconnected through app termination');
      //     process.exit(0);
      //   });
      // });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * configureSequelize creates a mongo connection to store DB based configurations
 * 
 * @returns {Promise} connects to configuration db
 */
function configureSequelize() {
  return new Promise((resolve, reject) => {
    try {
      // Basic usage (sql)
      const sqlConfig = this.config.configuration.options;
      const configurationSQLdB = new Sequelize(sqlConfig.database, sqlConfig.username, sqlConfig.password, sqlConfig.connection_options);
      const configurationModel = configurationSQLdB.define('configuration', schemas.config.sequelize.scheme, schemas.config.sequelize.options);
      const extensionModel = configurationSQLdB.define('extension', schemas.extension.sequelize.scheme, schemas.extension.sequelize.options);
      // configurationSQLdB.sync({force:true})
      configurationSQLdB.sync({})
        .then(_connection => _connection.authenticate())
        .then(_connection => {
          const CoreConfigDataAdapter = this.core.data.create({
            adapter: 'sql',
            model: configurationModel,
            db_connection: configurationSQLdB,
            docid: '_id',
          });
          const CoreExtensionDataAdapter = this.core.data.create({
            adapter: 'sql',
            model: extensionModel,
            db_connection: configurationSQLdB,
            docid: '_id',
          });
          this.datas.set('configuration', CoreConfigDataAdapter);
          this.datas.set('extension', CoreExtensionDataAdapter);
          this.dbs.set('configuration', configurationSQLdB);
          resolve(true);
        })
        .catch(reject);
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
          this.config.configuration = customConfig || app_configuration_settings.configuration;
          this.settings = Object.assign({}, app_configuration_settings.settings);
          // console.log('this.config', this.config);
          if (this.config.configuration.type === 'db') {
            switch (this.config.configuration.db) {
              case 'lowkie':
                return configureLowkie.call(this);
              case 'mongoose':
                return configureMongoose.call(this);
              case 'sequelize':
                return configureSequelize.call(this);
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
        this.status.emit('ready', true);
        resolve(updatedSettings);
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

function getContentDBModelDir(periodic_db_name) {
  return path.join(this.config.app_root, `content/config/databases/${periodic_db_name}/models`);
}

function assignLowkieModels(options) {
  const { modelFiles, modelDirPath, periodic_db_name, db, resolve, } = options;
  const modelpaths = modelFiles.filter(model => model.indexOf('lowkie') !== -1);
  modelpaths.forEach(modelFilePath => {
    const modelName = modelFilePath.split('.')[0];
    const modelModule = require(path.join(modelDirPath, modelFilePath));
    const lowkieModel = lowkie.model(
      modelName, //modelname
      lowkie.Schema(Object.assign({}, modelModule.scheme, schemeDefaults.lowkie(modelName))), //schema
      modelModule.options,
      periodic_db_name);
    const CoreConfigDataAdapter = this.core.data.create({
      adapter: 'loki',
      model: lowkieModel,
    });
    this.datas.set(`${periodic_db_name}_${modelName}`, CoreConfigDataAdapter);
  });
  this.dbs.set(periodic_db_name, db);
  resolve(true);
}

function assignMongooseModels(options) {
  const { modelFiles, modelDirPath, periodic_db_name, db, resolve, } = options;
  const modelpaths = modelFiles.filter(model => model.indexOf('mongoose') !== -1);
  modelpaths.forEach(modelFilePath => {
    const modelName = modelFilePath.split('.')[0];
    const modelModule = require(path.join(modelDirPath, modelFilePath));
    const modelSchema = new mongoose.Schema(
      Object.assign({}, modelModule.scheme, schemeDefaults.mongoose(modelName)),
      modelModule.options
    );
    const mongooseModel = db.model(
      modelName, //modelname
      modelSchema);
    const CoreConfigDataAdapter = this.core.data.create({
      adapter: 'mongo',
      model: mongooseModel,
    });
    this.datas.set(`${periodic_db_name}_${modelName}`, CoreConfigDataAdapter);
  });
  this.dbs.set(periodic_db_name, db);
  resolve(true);
}

function getDBModelDir(options) {
  const { db_config_type, periodic_db_name, } = options;
  switch (db_config_type) {
    case 'content':
    default:
      return getContentDBModelDir.call(this, periodic_db_name);
  }
}

function connectLowkieDB(options) {
  return new Promise((resolve, reject) => {
    try {
      const { periodic_db_name, db_config_type, } = options;
      const dboptions = options.options;
      lowkie.connect(dboptions.dbpath, {}, {}, periodic_db_name)
        .then((db) => {
          let modelDirPath = getDBModelDir.call(this, {
            db_config_type,
            periodic_db_name,
          });
          fs.readdir(modelDirPath)
            .then(modelFiles => assignLowkieModels.call(this, {
              modelFiles,
              modelDirPath,
              periodic_db_name,
              db,
              resolve,
            }))
            .catch(reject);
        })
        .catch(reject);
      lowkie.connection.on('connectionError', (e) => reject);
    } catch (e) {
      reject(e);
    }
  });
}

function connectMongooseDB(options) {
  return new Promise((resolve, reject) => {
    try {
      const { periodic_db_name, db_config_type, } = options;
      const dboptions = options.options;
      const mongooseDB = mongoose.createConnection(dboptions.url, dboptions.mongoose_options);
      mongooseDB.on('connected', () => {
        let modelDirPath = getDBModelDir.call(this, {
          db_config_type,
          periodic_db_name,
        });
        fs.readdir(modelDirPath)
          .then(modelFiles => assignMongooseModels.call(this, {
            modelFiles,
            modelDirPath,
            periodic_db_name,
            db: mongooseDB,
            resolve,
          }))
          .catch(reject);
      });
      mongooseDB.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

function connectDB(dbsettings) {
  return new Promise((resolve, reject) => {
    try {
      switch (dbsettings.db) {
        case 'lowkie':
          resolve(connectLowkieDB.call(this, dbsettings));
          break;
        case 'mongoose':
          resolve(connectMongooseDB.call(this, dbsettings));
          break;
        default:
          resolve(true);
          break;
      }
    } catch (e) {
      reject(e);
    }
  });
}

function loadDatabases() {
  return new Promise((resolve, reject) => {
    try {
      const databases = Object.keys(this.settings.databases).map(db => {
        return Object.assign({
            periodic_db_name: db,
            db_config_type: 'content',
          },
          this.settings.databases[db]);
      });
      const connectSettingsDB = connectDB.bind(this);
      resolve(Promisie.each(databases, 5, connectSettingsDB));
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  configureLowkie,
  configureMongoose,
  configureSequelize,
  loadConfiguration,
  loadAppSettings,
  loadDatabases,
  connectDB,
  connectLowkieDB,
};