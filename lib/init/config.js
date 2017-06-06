'use strict';
const path = require('path');
const fs = require('fs-extra');
const capitalize = require('capitalize');
const lowkie = require('lowkie');
const semver = require('semver');
const mongoose = require('mongoose');
const Promisie = require('promisie');
const Sequelize = require('sequelize');
const CoreControllerModule = require('periodicjs.core.controller');
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
          const configurationModel = lowkie.model('configuration', schemas.config.lowkie, {});
          const extensionModel = lowkie.model('extension', schemas.extension.lowkie, { unique: ['name', ], });
          const CoreConfigDataAdapter = this.core.data.create({
            adapter: 'loki',
            model: configurationModel,
          });
          const CoreExtensionDataAdapter = this.core.data.create({
            adapter: 'loki',
            model: extensionModel,
          });
          this.dbs.set('configuration', db);
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
      const CoreConfigDataAdapter = this.core.data.create({ adapter: 'mongo', model: configurationModel, });
      const CoreExtensionDataAdapter = this.core.data.create({ adapter: 'mongo', model: extensionModel, });
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
        .then(() => {
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
 * reads content/config/config.json for configuration database
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
  });
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

function assignControllers(options) {
  const { dboptions, controller_name, modelName, CoreConfigDataAdapter, periodic_db_name, } = options;
  // console.log('this.core.controller',this.core.controller)
  const CoreController = new CoreControllerModule(this, {
    compatibility: false,
    skip_responder: true,
    skip_db: true,
    skip_protocol: true,
  });
  CoreController.initialize_responder(dboptions.controller[controller_name].responder);
  CoreController.initialize_protocol(dboptions.controller[controller_name].protocol);
  CoreController.db[modelName] = CoreConfigDataAdapter;

  this.controllers.core.set(`${periodic_db_name}_${controller_name}_${modelName}`, CoreController.db[modelName]);
  this.routers.set(`${periodic_db_name}_${controller_name}_${modelName}`, {
    type: 'data',
    router_base: `${periodic_db_name}_${controller_name}`,
    router: CoreController.protocol.api.implement({
      model_name: modelName,
      dirname: path.join(this.config.app_root, 'app/views'),
    }).router,
  });

  if (controller_name === 'default') {
    let controller_router = this.routers.get(`${periodic_db_name}_${controller_name}_${modelName}`);
    this.controllers.core.set(`${periodic_db_name}_${modelName}`, this.controllers.core.get(`${periodic_db_name}_${controller_name}_${modelName}`));
    this.routers.set(`${periodic_db_name}_${modelName}`, {
      type: controller_router.type,
      router_base: periodic_db_name,
      router: controller_router.router,
    });
  }

  // CoreController.initialize_responder({ adapter: 'json' });
}

function assignLowkieModels(options) {
  const { modelFiles, modelDirPath, periodic_db_name, db, resolve, dboptions, reject, } = options;
  try {
    const modelpaths = modelFiles.filter(model => model.indexOf('lowkie') !== -1);

    modelpaths.forEach(modelFilePath => {
      const modelName = modelFilePath.split('.')[0];
      const modelModule = require(path.join(modelDirPath, modelFilePath));
      const lowkieModel = lowkie.model(
          modelName, //modelname
          lowkie.Schema(Object.assign({}, modelModule.scheme, schemeDefaults.lowkie(modelName)), periodic_db_name), //schema
          modelModule.options,
          periodic_db_name);
      const CoreConfigDataAdapter = this.core.data.create(
        Object.assign({
          adapter: 'loki',
          model: lowkieModel,
        }, modelModule.coreDataOptions));
      if (dboptions.controller) Object.keys(dboptions.controller).forEach(controller_name => assignControllers.call(this, { dboptions, controller_name, modelName, CoreConfigDataAdapter, periodic_db_name, }));
      this.datas.set(`${periodic_db_name}_${modelName}`, CoreConfigDataAdapter);
    });
    this.dbs.set(periodic_db_name, db);
    resolve(true);
  } catch (e) {
    reject(e);
  }
}

function assignMongooseModels(options) {
  const { modelFiles, modelDirPath, periodic_db_name, db, resolve, reject, dboptions, } = options;
  try {
    const modelpaths = modelFiles.filter(model => model.indexOf('mongoose') !== -1);
    modelpaths.forEach(modelFilePath => {
      const modelName = modelFilePath.split('.')[0];
      const modelModule = require(path.join(modelDirPath, modelFilePath));
      const modelSchema = new mongoose.Schema(
        Object.assign({}, modelModule.scheme, schemeDefaults.mongoose(modelName)),
        modelModule.options
      );
      const mongooseModel = db.model(
        capitalize(modelName), //modelname
        modelSchema);

      const CoreConfigDataAdapter = this.core.data.create(
        Object.assign({
          adapter: 'mongo',
          model: mongooseModel,
        }, modelModule.coreDataOptions));
      if (dboptions.controller) Object.keys(dboptions.controller).forEach(controller_name => assignControllers.call(this, { dboptions, controller_name, modelName, CoreConfigDataAdapter, periodic_db_name, }));

      this.datas.set(`${periodic_db_name}_${modelName}`, CoreConfigDataAdapter);
    });

    this.dbs.set(periodic_db_name, db);
    resolve(true);
  } catch (e) {
    reject(e);
  }
}

function assignSequelizeModels(options) {
  const { modelFiles, modelDirPath, periodic_db_name, db, resolve, reject, dboptions, } = options;
  const modelpaths = modelFiles.filter(model => model.indexOf('sequelize') !== -1);
  const modelAssociations = [];
  const models = modelpaths.map(modelFilePath => {
    const modelName = modelFilePath.split('.')[0];
    const modelModule = require(path.join(modelDirPath, modelFilePath));
    const modelSchema = Object.assign({},
      modelModule.scheme,
      schemeDefaults.sequelize(modelName)
    );
    const modelDefinition = db.define(
      modelName,
      modelSchema,
      modelModule.options
    );
    modelAssociations.push(...modelModule.associations);
    return {
      name: modelName,
      data: modelDefinition,
      associations: modelModule.associations,
      coreDataOptions: modelModule.coreDataOptions,
    };
  });
  const modelObj = models.reduce((result, key, i) => {
    result[key.name] = models[i].data;
    return result;
  }, {});
  // console.log({ modelObj, modelAssociations });
  /**
   *modelObj: { item: item, user: user }
   * [{
    source: 'user',
    association: 'hasOne',
    target: 'item',
    options: {
      as: 'primaryauthor',
    },
  },{
    source: 'item',
    association: 'hasMany',
    target: 'user',
    options: {
      as: 'authors',
    },
  },]


  User.belongsTo(Company); // Will add company_uuid to user
   */
  modelAssociations.forEach(modelAssoc => {
    // console.log({ modelAssoc })
    //item.hasOne(user,{as:primaryauthor})
    modelObj[modelAssoc.source][modelAssoc.association](modelObj[modelAssoc.target], modelAssoc.options);
  });

  db.sync({})
    .then(_connection => _connection.authenticate())
    .then(() => {
      // console.log({ _connection });
      models.forEach(model => {
        const CoreConfigDataAdapter = this.core.data.create(Object.assign({
          adapter: 'sql',
          model: model.data,
          db_connection: db,
          docid: '_id',
        }, model.coreDataOptions));
        if (dboptions.controller) Object.keys(dboptions.controller).forEach(controller_name => assignControllers.call(this, { dboptions, controller_name, modelName: model.name, CoreConfigDataAdapter, periodic_db_name, }));

        this.datas.set(`${periodic_db_name}_${model.name}`, CoreConfigDataAdapter);
      });
      this.dbs.set(periodic_db_name, db);
      resolve(true);
    })
    .catch(reject);
}

function getContentDBModelDir(periodic_db_name) {
  return path.join(this.config.app_root, `content/config/databases/${periodic_db_name}/models`);
}

function getExtensionDBModelDir(options) {
  const { periodic_db_name, db_ext_name } = options;
  return path.join(this.config.app_root, `node_modules/${db_ext_name}/config/databases/${periodic_db_name}/models`);
}

function getDBModelDir(options) {
  const { db_config_type, periodic_db_name, db_ext_name, } = options;
  // console.log('getDBModelDir',{ options });  
  switch (db_config_type) {
    case 'extension':
      return getExtensionDBModelDir.call(this, { db_ext_name, periodic_db_name });
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
      const __LOWKIE_DB_PATH = (dboptions.use_absolute_dbpath) ? dboptions.dbpath:path.resolve(this.config.app_root, dboptions.dbpath);
      lowkie.connect(__LOWKIE_DB_PATH, dboptions.dboptions, {}, periodic_db_name)
        .then((db) => {
          let modelDirPath = getDBModelDir.call(this, {
            db_ext_name: options.extension,
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
              reject,
              dboptions: options,
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
          db_ext_name: options.extension,
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
            reject,
            dboptions: options,
          }))
          .catch(reject);
      });
      mongooseDB.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

function connectSequelizeDB(options) {
  return new Promise((resolve, reject) => {
    try {
      const { periodic_db_name, db_config_type, } = options;
      const dboptions = options.options;
      // console.log({ dboptions });
      const sequelizeDB = new Sequelize(dboptions.database, dboptions.username, dboptions.password, dboptions.connection_options);
      const modelDirPath = getDBModelDir.call(this, {
        db_ext_name: options.extension,
        db_config_type,
        periodic_db_name,
      });
      fs.readdir(modelDirPath)
        .then(modelFiles => assignSequelizeModels.call(this, {
          modelFiles,
          modelDirPath,
          periodic_db_name,
          db: sequelizeDB,
          dboptions: options,
          resolve,
          reject,
        }))
        .catch(reject);
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
        case 'sequelize':
          resolve(connectSequelizeDB.call(this, dbsettings));
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
      }) || [];
      const extension_databases = Object.keys(this.resources.databases.extensions).map(db => {
        return Object.assign({
            periodic_db_name: db,
            db_config_type: 'extension',
          },
          this.resources.databases.extensions[db]);
      }) || [];
      databases.push(...extension_databases);
      const connectSettingsDB = connectDB.bind(this);
      if (databases.length) {
        resolve(Promisie.each(databases, 5, connectSettingsDB));
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function filterRequiredDependencies(extDep) {
  return extDep.optional !== true;
}

function mapForExtensionDependencyName(extDep) {
  return extDep.extname;
}

function checkForRequiredExtensions(options) {
  const { reqExt, errors, ext, } = options;
  if (this.extensions.has(reqExt) !== true) {
    errors.push(Error(`Extension (${ext.name}), requires Extension ${reqExt}`));
  }
}

function checkExtensionDependencies(options) {
  const { errors, ext, } = options;
  const requiredExtDependencies = (ext.periodic_dependencies && ext.periodic_dependencies.length) ?
    ext.periodic_dependencies.filter(filterRequiredDependencies).map(mapForExtensionDependencyName) : [];

  requiredExtDependencies.forEach(reqExt => checkForRequiredExtensions.call(this, { errors, ext, reqExt, }));

  // console.log(ext.name, { requiredExtDependencies }, requiredExtDependencies.size);
  if (semver.lt(this.settings.application.version, ext.periodic_compatibility)) {
    errors.push(Error(`Extension (${ext.name}), requires Periodic ${ext.periodic_compatibility}, and is not compabitility with ${this.settings.application.version}`));
  } else {
    // console.log('adding ext.name', ext.name);
    this.extensions.set(ext.name, ext);
  }
}

function loadExtensions() {
  return new Promise((resolve, reject) => {
    try {
      const errors = [];
      this.crud.ext.list()
        .then(extensions => {
          // const extensionNames = new Set(extensions.map(ext => ext.name));
          // console.log({ extensionNames });
          this.extensions = new Map();
          extensions.forEach(ext => checkExtensionDependencies.call(this, { errors, ext, }));
          if (errors.length) {
            errors.forEach(error => this.logger.error(error));
          }
          if (this.settings.application.exit_on_invalid_extensions && errors.length) {
            reject(new Error('Invalid extension configuration'));
          } else {
            resolve(true);
          }
        })
        .catch(reject);
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
  loadExtensions,
  loadDatabases,
  connectDB,
  connectLowkieDB,
  connectSequelizeDB,
  connectMongooseDB,
  getDBModelDir,
  assignSequelizeModels,
  assignMongooseModels,
  assignLowkieModels,
  getContentDBModelDir,
  checkExtensionDependencies,
  checkForRequiredExtensions,
  mapForExtensionDependencyName,
  filterRequiredDependencies,
  assignControllers,
};