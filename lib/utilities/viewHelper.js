'use strict';
const querystring = require('querystring');
const path = require('path');
const numeral = require('numeral');
const pluralize = require('pluralize');
const capitalize = require('capitalize');
const moment = require('moment');

module.exports = {
  querystring,
  numeral,
  moment,
  pluralize,
  capitalize,
  path,
  /** helper function exposes a server javascript object to the client
   * @param {object} obj server object for the client
   * @param {object} nameOfClientObj name of exposed server object for the client
   * @returns {string} javascript statement that contains server javascript object
   */
  passObjToClient: function(obj, nameOfClientObj) {
    return 'var ' + nameOfClientObj + ' = ' + (JSON.stringify(obj));
  },
};