'use strict';
// const events = require('events');
// const periodicSchema = require('./schema');
// const periodicModel = require('./model');
// const periodicConnect = require('./connect');
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
    this.config = Object.assign({
      debug: false,
      app_root:process.cwd(),
      settings: {},
    }, options);
    // this.connections = new Map();
    this.controllers = new Map();
    this.containers = new Map();
    this.extensions = new Map();
    this.dbs = new Map();
    this.logger = console;
    // this.db = undefined;
    this.app = {};//express app
    // this.controller = peroidicController.bind(this);
    // this.container = peroidicContainer.bind(this);
    // this.extension = peroidicExtension.bind(this);
    return new Proxy(this, periodicProxyHandler.call(this));
  }
  /**
   * initialize a periodic application, by creating folder structure, using a CLI application, cluster & fork the main thread, start the web server, use a socket server
   * 
   * 
   * @memberOf periodic
   */
  init() {
    //set up folder structure
    //configure application
    //use cli process
    //cluster process
    //start web server
    //start socket server
  }
  // /**
  //  * creates periodic schema, also includes helpers for document validations
  //  * 
  //  * @param {object} scheme 
  //  * @returns instance of periodicSchema
  //  * 
  //  * @memberOf periodic
  //  */
  // Schema(scheme) {
  //   return new periodicSchema(scheme, this);
  // }
}

module.exports = periodic;
