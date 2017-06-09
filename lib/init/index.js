'use strict';
const setUpFolderStructure = require('./folderStructure');
const timer = require('./consoleTimer');
const config = require('./config');
const runtime = require('./runtime');
const logger = require('./logger');
const express = require('./express');
const server = require('./server');
const cluster = require('./cluster');
const cli = require('./cli');

module.exports = {
  setUpFolderStructure,
  timer,
  config,
  runtime,
  logger,
  express,
  server,
  cluster,
  cli,
};