'use strict';
// const events = require('events');
// const periodicSchema = require('./schema');
// const periodicModel = require('./model');
// const periodicConnect = require('./connect');
const periodicInit = require('./init');
const Promisie = require('promisie');
const CoreData = require('periodicjs.core.data');
const periodicProxyHandler = require('./periodicProxyHandler');
/**
 * periodic singleton class
 * 
 * @class periodic
 */
class periodic {
  /**
   * Creates an instance of periodic.
   * @param {any} [options={}]
   * @param {boolean} options.debug use debugging logs
   * @return {object} proxied periodic singleton object
   * 
   * @memberOf periodic
   */
  constructor(options = {}) {
      //https://www.npmjs.com/package/express-react-engine
      this.config = Object.assign({
        debug: false,
        app_root: process.cwd(),
        configuration: {},
        // settings: {},
      }, options);
      this.settings = {};
      // this.connections = new Map();
      this.controllers = new Map();
      this.containers = new Map();
      this.extensions = new Map();
      this.datas = new Map();
      this.dbs = new Map();
      this.logger = console;
      this.logger.silly = console.log;
      this.logger.debug = console.log;
      this.logger.info = console.info;
      this.logger.warn = console.log;
      this.logger.error = console.error;
      // this.db = undefined;
      this.app = {}; //express app
      this.core = {
        data: CoreData,
      };

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
    this.config = Object.assign({}, this.config, options);
    //set up folder structure
    const setUpFolderStructure = periodicInit.setUpFolderStructure.bind(this);
    //configure application
    const setupConfiguration = periodicInit.config.loadConfiguration.bind(this);
    const setupRuntimeEnv = periodicInit.runtime.configRuntimeEnvironment.bind(this);
    const setAppSettings = periodicInit.config.loadAppSettings.bind(this);
    //use cli process
    //cluster process
    //start web server
    //start socket server
    // return Promisie.series([(resolve, reject) => { 

    // }]);


    return Promisie.series([
      periodicInit.timer.startTimer,
      setUpFolderStructure,
      setupConfiguration,
      setupRuntimeEnv,
      setAppSettings,
      periodicInit.timer.endTimer,
    ]);
  }
}

module.exports = periodic;