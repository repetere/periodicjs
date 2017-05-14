'use strict';
const winston = require('winston');
const path = require('path');

function getDefaultWinstonLoggerConfig(options) {
  try {
    const periodicInstance = options.periodic;
    const fileNamePathAddition = options.fileNamePathAddition;
    return (periodicInstance.environment === 'production') ? {
      transports: [
        new(winston.transports.Console)({
          level: 'error',
          colorize: true,
        }),
        new(winston.transports.File)({
          filename: path.join(periodicInstance.config.app_root, 'logs', fileNamePathAddition + '.exception-errors.log'),
        }),
      ],
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
          filename: path.join(periodicInstance.config.app_root, 'logs', fileNamePathAddition + '.app.log'),
        }),
      ],
      exceptionHandlers: [
        new(winston.transports.Console)({
          colorize: true,
          json: true,
          prettyPrint: true,
          timestamp: true,
        }),
        new(winston.transports.File)({
          filename: path.join(periodicInstance.config.app_root, 'logs', fileNamePathAddition + '.exception-errors.log'),
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
          winstonLogger.configure(getDefaultWinstonLoggerConfig({
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

      process.on('uncaughtException', e => this.logger.error);
      process.on('warning', e => this.logger.warn);
      process.on('unhandledRejection', e => this.logger.error);
      // process.on('uncaughtException', (err) => {
      //   this.logger.error(err.message, err.stack, {
      //     err,
      //   });
      // });
      // process.on('warning', err => {
      //   this.logger.warn(err.message, err.stack);
      // });
      // process.on('unhandledRejection', (reason, p) => {
      //   if (reason.message && reason.stack) {
      //     this.logger.error(reason.message, reason.stack, {
      //       reason,
      //     });
      //   } else {
      //     this.logger.error('unhandledRejection', reason);
      //   }
      // });
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