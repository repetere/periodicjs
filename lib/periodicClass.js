'use strict';
// const periodicSchema = require('./schema');
// const periodicModel = require('./model');
// const periodicConnect = require('./connect');
const Promisie = require('promisie');
const express = require('express');
const events = require('events');
const CoreData = require('periodicjs.core.data');
const CoreUtilities = require('periodicjs.core.utilities');
// const CoreController = require('periodicjs.core.controller');
const periodicInit = require('./init');
const periodicExtension = require('./extension');
const periodicCrud = require('./crud');
const periodicUtils = require('./utilities');
const periodicProxyHandler = require('./periodicProxyHandler');
/**
 * periodic singleton class
 * 
 * @class Periodic
 */
class Periodic {
  /**
   * Creates an instance of periodic.
   * @param {any} [options={}]
   * @param {boolean} options.debug use debugging logs
   *  @param {String} options.app_root the path to the application's root directory
   * @return {object} proxied periodic singleton object
   * 
   * @memberOf Periodic
   */
  constructor(options = {}) {
      //https://www.npmjs.com/package/express-react-engine
      this.config = Object.assign({
        debug: false,
        setMaxListeners: 0,
        app_root: process.cwd(),
        configuration: {},
        // settings: {},
      }, options);
      events.EventEmitter.defaultMaxListeners = this.config.setMaxListeners;
      this.settings = {};
      this.utilities = periodicUtils;
      this.express = express;
      this.app = express();
      // this.connections = new Map();
      this.status = new events.EventEmitter();
      this.controllers = {
        core: new Map(),
        extension: new Map(),
        container: new Map(),
      };
      this.resources = {
        standard_models: [],
        databases: {
          extensions: {},
          container: {},
        },
        commands: {
          extensions: new Map(),
          container: new Map(),
        },
      };
      this.locals = {
        core: new Map(),
        extensions: new Map(),
        container: new Map(),
      };
      this.routers = new Map();
      this.containers = new Map();
      this.extensions = new Map();
      this.servers = new Map();
      this.datas = new Map();
      this.dbs = new Map();
      this.tasks = {
        resetExtensions: periodicInit.config.loadExtensions.bind(this),
        installExtension: periodicExtension.install.installExtension.bind(this),
        uninstallExtension: periodicExtension.uninstall.uninstallExtension.bind(this),
      };
      this.transforms = {
        pre: {
          CONNECT: {},
          DELETE: {},
          GET: {},
          HEAD: {},
          OPTIONS: {},
          POST: {},
          PUT: {},
        },
        post: {
          CONNECT: {},
          DELETE: {},
          GET: {},
          HEAD: {},
          OPTIONS: {},
          POST: {},
          PUT: {},
        },
      };

      this.crud = {
        config: {
          create: periodicCrud.config.create.bind(this),
          update: periodicCrud.config.update.bind(this),
          remove: periodicCrud.config.remove.bind(this),
          init: periodicCrud.config.init.bind(this),
          get: periodicUtils.mock.tempPromise,
          list: periodicUtils.mock.tempPromise,
        },
        ext: {
          create: periodicCrud.ext.create.bind(this),
          update: periodicUtils.mock.tempPromise,
          remove: periodicCrud.ext.remove.bind(this),
          get: periodicUtils.mock.tempPromise,
          list: periodicCrud.ext.list.bind(this),
          init: periodicCrud.ext.init.bind(this, false),
        },
        con: {
          create: periodicUtils.mock.tempPromise,
          update: periodicUtils.mock.tempPromise,
          remove: periodicUtils.mock.tempPromise,
          get: periodicUtils.mock.tempPromise,
          list: periodicUtils.mock.tempPromise,
          init: periodicCrud.ext.init.bind(this, 'container'),
        },
      };
      this.logger = console;
      this.logger.silly = console.log;
      this.logger.debug = console.log;
      this.logger.verbose = console.info;
      this.logger.info = console.info;
      this.logger.warn = console.info;
      this.logger.error = console.error;
      // this.db = undefined;
      // this.app = {}; //express app
      this.core = {
        data: CoreData,
        utilities: new CoreUtilities(this)
        // controller:
      };
      // console.log('this.core.controller',this.core.controller);

      // this.controller = peroidicController.bind(this);
      // this.container = peroidicContainer.bind(this);
      // this.extension = peroidicExtension.bind(this);
      return new Proxy(this, periodicProxyHandler.call(this));
    }
    /**
     * initialize a periodic application, by creating folder structure, using a CLI application, cluster & fork the main thread, start the web server, use a socket server
     * @param {Boolean} options.debug log debug output
     * @param {String} options.app_root the path to the application's root directory
     * @param {Object} options.settings set initial settings before configurations are loaded
     *
     * @returns {Promise} fully resolved periodic instance
     * @memberOf periodic
     */
  init(options = {}) {
    process.setMaxListeners(this.config.setMaxListeners || 0);
    this.status.emit('initializing', true);
    this.config = Object.assign({}, this.config, options);

    return new Promise((resolve, reject) => {
      const completInit = periodicInit.runtime.completeInitialization.bind(this, resolve, reject);
      Promisie.series([
          periodicInit.timer.startTimer.bind(this),
          periodicInit.setUpFolderStructure.bind(this),
          periodicInit.config.loadConfiguration.bind(this),
          periodicInit.runtime.configRuntimeEnvironment.bind(this),
          periodicInit.config.loadAppSettings.bind(this),
          periodicInit.logger.configureLogger.bind(this),
          periodicInit.config.loadExtensions.bind(this),
          periodicInit.config.setupGenericCoreController.bind(this),
          periodicExtension.setup.setupExtensions.bind(this),
          periodicExtension.setup.setupContainer.bind(this),
          periodicInit.config.loadDatabases.bind(this),
          periodicInit.logger.catchProcessErrors.bind(this),
          periodicInit.express.initializeExpress.bind(this),
          periodicInit.cli.run.bind(this),
          periodicInit.cluster.forkProcess.bind(this),
          periodicInit.server.initializeServers.bind(this),
          periodicInit.timer.endTimer.bind(this),
        ]).then(resolve)
        .catch(completInit);
    });
  }
}

module.exports = Periodic;