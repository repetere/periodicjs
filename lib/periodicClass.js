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
   * 
   * @memberOf periodic
   */
  constructor(options = {}) {
    // this.config = Object.assign({
    //   adapterType: 'file',
    //   debug: false,
    //   strictSchemas: true,
    //   overwriteInvalidJSON:true,
    // }, options);
    // this.connections = new Map();
    // this.db = undefined;
    // this.models = {};
    // this.connection = new events.EventEmitter();
    // this.model = periodicModel.bind(this);
    // this.connect = periodicConnect.bind(this);
    // this.Schema.Types = periodicSchema.Types;
    return new Proxy(this, periodicProxyHandler.call(this));
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
