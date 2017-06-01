'use strict';
const winston = require('winston');
const path = require('path');

function getDefaultWinstonLoggerConfig(options) {
  try {
    const { periodic, fileNamePathAddition, } = options;
    return (periodic.environment === 'production') ? {
      transports: [
        new(winston.transports.Console)({
          level: 'error',
          colorize: true,
        }),
        new(winston.transports.File)({
          filename: path.join(periodic.config.app_root, 'logs', fileNamePathAddition + '.exception-errors.log'),
        }),
      ],
      exitOnError: this.settings.logger.winston_exit_on_error,
      handleExceptions: true,
    } : {
      transports: [
        new(winston.transports.Console)({
          colorize: true,
          level: 'silly',
          prettyPrint: true,
          timestamp: true,
        }),
        new(winston.transports.File)({
          filename: path.join(periodic.config.app_root, 'logs', fileNamePathAddition + '.app.log'),
        }),
      ],
      exitOnError: this.settings.logger.winston_exit_on_error,
      exceptionHandlers: [
        new(winston.transports.Console)({
          colorize: true,
          json: true,
          prettyPrint: true,
          timestamp: true,
        }),
        new(winston.transports.File)({
          filename: path.join(periodic.config.app_root, 'logs', fileNamePathAddition + '.exception-errors.log'),
        }),
      ],
      handleExceptions: true,
    };
  } catch (e) {
    this.logger.error(e);
    return {};
  }
};

/**
 * configures winston
 * 
 * @returns {Promise} configureLogger sets up winston
 */
function configureLogger() {
  return new Promise((resolve, reject) => {
    try {
      const d = new Date();
      const fileNamePathAddition = this.environment + '-' + d.getUTCFullYear() + '.' + (d.getUTCMonth() + 1) + '.' + d.getUTCDate();
      if (this.settings.logger.use_winston_logger && this.environment !== 'DISABLELOG') {
        const winstonLogger = new(winston.Logger)();
        winstonLogger.exitOnError = this.settings.logger.winston_exit_on_error;
        if (this.settings.logger.use_standard_logging) {
          winstonLogger.configure(getDefaultWinstonLoggerConfig.call(this,{
            fileNamePathAddition,
            periodic: this,
          }));
        }
        this.logger = winstonLogger;
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function catchProcessErrors() {
  return new Promise((resolve, reject) => {
    try {
      if (!this.logger) this.logger = console;
      process.on('uncaughtException', this.logger.error.bind(this.logger));
      process.on('warning', this.logger.warn.bind(this.logger));
      process.on('unhandledRejection', this.logger.error.bind(this.logger));
      resolve(this.config);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  configureLogger,
  catchProcessErrors,
  getDefaultWinstonLoggerConfig,
};