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
const CoreMailerModule = require('periodicjs.core.mailer');
const defaultSettings = require('../defaults');
const schemas = require('../schemas');
const flatten = require('flat');
const schemeDefaults = require('../defaults/schema');
mongoose.Promise = Promisie;
const fullModelFilePath = '/___FULLPATH___';

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
          const CoreConfigDataAdapter = this.core.data.create(
            Object.assign({
              adapter: 'loki',
              model: configurationModel,
            }, schemeDefaults.coreDataOptions.configuration)
          );
          const CoreExtensionDataAdapter = this.core.data.create(
            Object.assign({
              adapter: 'loki',
              model: extensionModel,
            }, schemeDefaults.coreDataOptions.extension)
          );
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
      // console.log({ mongooseConfig },'mongooseConfig.mongoose_options',mongooseConfig.mongoose_options)
      const configurationMongoose = mongoose.createConnection(mongooseConfig.url, mongooseConfig.mongoose_options);
      const configurationModel = configurationMongoose.model('configuration', schemas.config.mongoose);
      const extensionModel = configurationMongoose.model('extension', schemas.extension.mongoose);
      const CoreConfigDataAdapter = this.core.data.create(
        Object.assign({
          adapter: 'mongo',
          model: configurationModel,
        }, schemeDefaults.coreDataOptions.configuration)
      );
      const CoreExtensionDataAdapter = this.core.data.create(
        Object.assign({
          adapter: 'mongo',
          model: extensionModel,
        }, schemeDefaults.coreDataOptions.extension)
      );
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

      if (this.config.debug) {
        mongoose.set('debug', true);
      }
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
          const CoreConfigDataAdapter = this.core.data.create(
            Object.assign({
              adapter: 'sql',
              model: configurationModel,
              db_connection: configurationSQLdB,
              docid: '_id',
            }, schemeDefaults.coreDataOptions.configuration)
          );
          const CoreExtensionDataAdapter = this.core.data.create(
            Object.assign({
              adapter: 'sql',
              model: extensionModel,
              db_connection: configurationSQLdB,
              docid: '_id',
            }, schemeDefaults.coreDataOptions.extension)
          );
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
 * reads content/config/(config.json||config.js) for  the configuration database
 *
 * @returns Promise loadConfiguration sets up application config db
 */
function loadConfiguration(customConfig) {
  return new Promise((resolve, reject) => {
    try {
      const __CONFIG_DIR = path.resolve(this.config.app_root, 'content/config');
      // const __CONFIG_JSON_PATH = path.join(__CONFIG_DIR, 'config.json');
      const app_configuration = require(path.join(__CONFIG_DIR, 'config'));
      // console.log({ app_configuration })
      // resolve(this);
      // fs.readJson(__CONFIG_JSON_PATH)
      Promise.resolve()
        .then(() => {
          if (typeof app_configuration === 'function') {
            return app_configuration.call(this);
          } else {
            return Promise.resolve(app_configuration);
          }
        })
        .then(app_configuration_settings => {
          this.config.configuration = (typeof customConfig === 'object' && Object.keys(customConfig).length) ? customConfig : app_configuration_settings.configuration;
          this.settings = Object.assign({}, app_configuration_settings.settings);
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
 * @memberof {config}{{}}
 * @returns Promise loadAppSettings config db
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
      }).then(dbenvconfig => {

        const envconfigJSON = (dbenvconfig && dbenvconfig.toJSON) ?
          dbenvconfig.toJSON() :
          dbenvconfig || {};
        const envconfig = envconfigJSON.config;
        const updatedSettings = flatten.unflatten(
          Object.assign({},
            flatten(defaultSettings.environment),
            flatten(envconfig || {}),
            flatten(this.settings || {}),
            flatten(this.config.settings || {})
          )
        );
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
  // console.log('this.transfor ms',this.transforms)
  CoreController.initialize_responder(dboptions.controller[ controller_name ].responder);
  CoreController.initialize_protocol(dboptions.controller[ controller_name ].protocol);
  CoreController.db[ modelName ] = CoreConfigDataAdapter;

  this.controllers.core.set(`${periodic_db_name}_${controller_name}_${modelName}`, CoreController);
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
  const { modelDirPath, periodic_db_name, db, resolve, dboptions, reject, } = options;
  let { modelFiles, } = options;
  try {
    if (periodic_db_name === 'standard' && this.resources.standard_models.length) {
      modelFiles = modelFiles.concat(this.resources.standard_models);
    }
    const modelpaths = modelFiles.filter(model => model.indexOf('lowkie') !== -1);

    modelpaths.forEach(modelFilePath => {
      const modelName = path.basename(modelFilePath.replace(fullModelFilePath, '')).split('.')[ 0 ];
      const modelModule = (modelFilePath.indexOf(fullModelFilePath) !== -1) ?
        require(modelFilePath.replace(fullModelFilePath, '')) :
        require(path.join(modelDirPath, modelFilePath));
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
      if (dboptions.controller) {
        Object.keys(dboptions.controller).forEach(controller_name => assignControllers.call(this, { dboptions, controller_name, modelName, CoreConfigDataAdapter, periodic_db_name, }));
      }
      this.datas.set(`${periodic_db_name}_${modelName}`, CoreConfigDataAdapter);
      this.models.set(`${periodic_db_name}_${modelName}`, modelModule);
    });
    this.dbs.set(periodic_db_name, db);
    resolve(true);
  } catch (e) {
    reject(e);
  }
}

function assignMongooseModels(options) {
  const { modelDirPath, periodic_db_name, db, resolve, reject, dboptions, } = options;
  let { modelFiles, } = options;

  try {
    if (periodic_db_name === 'standard' && this.resources.standard_models.length) {
      modelFiles = modelFiles.concat(this.resources.standard_models);
    }
    const modelpaths = modelFiles.filter(model => model.indexOf('mongoose') !== -1);
    modelpaths.forEach(modelFilePath => {
      const modelName = path.basename(modelFilePath.replace(fullModelFilePath, '')).split('.')[ 0 ];
      const modelModule = (modelFilePath.indexOf(fullModelFilePath) !== -1) ?
        require(modelFilePath.replace(fullModelFilePath, '')) :
        require(path.join(modelDirPath, modelFilePath));
      const modelSchema = new mongoose.Schema(
        Object.assign({}, modelModule.scheme, schemeDefaults.mongoose(modelName)),
        modelModule.options
      );
      if (modelModule.coreDataOptions.uniqueCompound) {
        modelSchema.index(modelModule.coreDataOptions.uniqueCompound, { unique: true, });
      }
      if (modelModule.indexes) {
        modelModule.indexes.forEach(newIndex => {
          modelSchema.index(newIndex.keys, newIndex.options);
        });
      }
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
      this.models.set(`${periodic_db_name}_${modelName}`, modelModule);
    });

    this.dbs.set(periodic_db_name, db);
    resolve(true);
  } catch (e) {
    reject(e);
  }
}


function assignSequelizeModels(options) {
  const { modelDirPath, periodic_db_name, db, resolve, reject, dboptions, } = options;
  let { modelFiles, } = options;
  if (periodic_db_name === 'standard' && this.resources.standard_models.length) {
    modelFiles = modelFiles.concat(this.resources.standard_models);
  }
  const modelpaths = modelFiles.filter(model => model.indexOf('sequelize') !== -1);
  const modelAssociations = [];
  const models = modelpaths.map(modelFilePath => {
    try {
      const modelName = path.basename(modelFilePath.replace(fullModelFilePath, '')).split('.')[ 0 ];
      const modelModule = (modelFilePath.indexOf(fullModelFilePath) !== -1) ?
        require(modelFilePath.replace(fullModelFilePath, '')) :
        require(path.join(modelDirPath, modelFilePath));

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
        modelModule,
      };
    } catch (e) {
      reject(e);
    }
  });
  const modelObj = models.reduce((result, key, i) => {
    result[ key.name ] = models[ i ].data;
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
    // console.log({ modelAssoc });
    modelObj[ modelAssoc.source ][ modelAssoc.association ](modelObj[ modelAssoc.target ], modelAssoc.options);
  });

  db.sync(dboptions.options.sync || {
    // alter: true,		
  })
    .then(_connection => _connection.authenticate())
    .then(() => {
      // console.log({ _connection });
      models.forEach(model => {
        // console.log('model.data', model.data);
        const CoreConfigDataAdapter = this.core.data.create(Object.assign({
          adapter: 'sql',
          model: model.name || model.data,
          db_connection: db,
          docid: '_id',
        }, model.coreDataOptions));
        if (dboptions.controller) Object.keys(dboptions.controller).forEach(controller_name => assignControllers.call(this, { dboptions, controller_name, modelName: model.name, CoreConfigDataAdapter, periodic_db_name, }));

        this.datas.set(`${periodic_db_name}_${model.name}`, CoreConfigDataAdapter);
        this.models.set(`${periodic_db_name}_${model.name}`, model.modelModule);
      });
      this.dbs.set(periodic_db_name, db);
      resolve(true);
    })
    .catch(e => {
      reject(e);
    });
}

function getContentDBModelDir(periodic_db_name) {
  return path.join(this.config.app_root, `content/config/databases/${periodic_db_name}/models`);
}

function getExtensionDBModelDir(options) {
  const { periodic_db_name, db_ext_name, } = options;
  return path.join(this.config.app_root, `node_modules/${db_ext_name}/config/databases/${periodic_db_name}/models`);
}

function getContainerDBModelDir(options) {
  const { periodic_db_name, db_container_name, db_container_type, } = options;
  if (db_container_type === 'local') {
    return path.join(this.config.app_root, `content/container/${db_container_name}/config/databases/${periodic_db_name}/models`);
  } else {
    return path.join(this.config.app_root, `node_modules/${db_container_name}/config/databases/${periodic_db_name}/models`);
  }
}

function getDBModelDir(options) {
  const { db_config_type, periodic_db_name, db_ext_name, db_container_name, db_container_type, } = options;
  // console.log('getDBModelDir',{ options });
  switch (db_config_type) {
  case 'container':
    return getContainerDBModelDir.call(this, { db_container_name, db_container_type, periodic_db_name, });
  case 'extension':
    return getExtensionDBModelDir.call(this, { db_ext_name, periodic_db_name, });
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
      const __LOWKIE_DB_PATH = (dboptions.use_absolute_dbpath) ? dboptions.dbpath : path.resolve(this.config.app_root, dboptions.dbpath);
      lowkie.connect(__LOWKIE_DB_PATH, dboptions.dboptions, {}, periodic_db_name)
        .then((db) => {
          let modelDirPath = getDBModelDir.call(this, {
            db_ext_name: options.extension,
            db_container_name: options.container,
            db_container_type: options.container_type,
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
      dboptions.mongoose_options = Object.assign({ config: { autoIndex: true, }, }, dboptions.mongoose_options);
      const mongooseDB = mongoose.createConnection(dboptions.url, dboptions.mongoose_options);
      mongooseDB.on('connected', () => {
        let modelDirPath = getDBModelDir.call(this, {
          db_ext_name: options.extension,
          db_container_name: options.container,
          db_container_type: options.container_type,
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
      const sequelizeDB = new Sequelize(dboptions.database, dboptions.username, dboptions.password, dboptions.connection_options);
      const modelDirPath = getDBModelDir.call(this, {
        db_ext_name: options.extension,
        db_container_name: options.container,
        db_container_type: options.container_type,
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
        this.settings.databases[ db ]);
      }) || [];
      const extension_databases = Object.keys(this.resources.databases.extensions).map(db => {
        return Object.assign({
          periodic_db_name: db,
          db_config_type: 'extension',
        },
        this.resources.databases.extensions[ db ]);
      }) || [];
      const container_databases = Object.keys(this.resources.databases.container).map(db => {
        return Object.assign({
          periodic_db_name: db,
          db_config_type: 'container',
        },
        this.resources.databases.container[ db ]);
      }) || [];
      databases.push(...extension_databases);
      databases.push(...container_databases);
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

function loadExternalRouters() {
  return new Promise((resolve, reject) => {
    try {
      if (this.config.process.skip_external_resources) return resolve(true);
      Array.from(this.extensions.values()).forEach(extension => {
        try {
          this.routers.set(`extension_${extension.name}`, {
            type: 'extension',
            router: require(`${extension.name}/routers/index`),
          });
        } catch (e) {
          if (this.config.debug) {
            this.logger.warn(`${extension.name} is missing a default router`, e);
          }
        }
      });
      if (this.settings.container && this.settings.container.name) {
        try {
          this.routers.set(`container_${this.settings.container.name}`, {
            type: 'container',
            router: (this.settings.container.type === 'local') ?
              require(`${this.config.app_root}/content/container/${this.settings.container.name}/routers/index`) : require(`${this.settings.container.name}/routers/index`),
          });
        } catch (e) {
          if (this.config.debug) {
            this.logger.warn(`${this.settings.container.name} is missing a default router`, e);
          }
        }
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function setupGenericCoreController() {
  return new Promise((resolve, reject) => {
    try {
      const StandardCoreController = new CoreControllerModule(this, {
        compatibility: false,
        responder_configuration: { adapter: 'html', },
        // skip_responder: true,
        skip_db: true,
        // skip_protocol: true,
      });
      // StandardCoreController.initialize_responder({ adapter:'html'});
      // StandardCoreController.initialize_protocol({});
      this.core.controller = StandardCoreController;
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function setupGenericCoreMailer() {
  return new Promise((resolve, reject) => {
    try {
      const StandardCoreMailer = new CoreMailerModule({
        config: {
          transportConfig: this.settings.core.mailer.transport_config,
        },
      });
      // StandardCoreMailer.initialize_responder({ adapter:'html'});
      // StandardCoreMailer.initialize_protocol({});
      this.core.mailer = StandardCoreMailer;
      resolve(true);
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
  loadExternalRouters,
  connectDB,
  connectLowkieDB,
  connectSequelizeDB,
  connectMongooseDB,
  getDBModelDir,
  assignSequelizeModels,
  assignMongooseModels,
  assignLowkieModels,
  getContentDBModelDir,
  getExtensionDBModelDir,
  getContainerDBModelDir,
  checkExtensionDependencies,
  checkForRequiredExtensions,
  mapForExtensionDependencyName,
  filterRequiredDependencies,
  assignControllers,
  setupGenericCoreController,
  setupGenericCoreMailer,
};
