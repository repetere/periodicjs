'use strict';
const setUpFolderStructure = require('./folderStructure');
const timer = require('./consoleTimer');
const config = require('./config');
const runtime = require('./runtime');
const logger = require('./logger');

module.exports = {
  setUpFolderStructure,
  timer,
  config,
  runtime,
  logger,
};