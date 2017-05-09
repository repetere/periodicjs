'use strict';
const setUpFolderStructure = require('./folderStructure');
const timer = require('./consoleTimer');
const config = require('./config');
const runtime = require('./runtime');

module.exports = {
  setUpFolderStructure,
  timer,
  config,
  runtime: runtime.configRuntimeEnvironment,
};