'use strict';
const winston = require('winston');
const path = require('path');

function getDefaultWinstonLoggerConfig(options) {
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
};

/**
 * configures winston
 * 
 * @returns {Promise} configureLogger sets up winston
 */
function configureLogger() {
  const d = new Date();
  const fileNamePathAddition = this.environment + '-' + d.getUTCFullYear() + '.' + (d.getUTCMonth() + 1) + '.' + d.getUTCDate();
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.logger.use_winston_logger) {
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
      process.on('uncaughtException', function(err) {
        this.logger.error(err.message, err.stack, {
          err: err
        });
      });
      process.on('warning', err => {
        this.logger.warn(err.message, err.stack);
      });
      process.on('unhandledRejection', (reason, p) => {
        if (reason.message && reason.stack) {
          this.logger.error(reason.message, reason.stack, {
            reason: err
          });
        } else {
          this.logger.error('unhandledRejection', reason);
        }
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

/*


app = express(),
    application_settings,
    extension_helper,
    expressAppLogger = require('morgan'),
    AppLog = require('../../content/config/logger'),
    Config = require('./config'),
    appconfig,
    periodicObj,
    customThemeView = 'home/error500',
    logger,



        // init.loadConfiguration();
        // init.useLogger();
        // init.viewSettings();
        // init.expressSettings();
        // init.staticCaching();
        // init.pageCompression();
        // init.appLogging();
        // init.useSessions();
        // init.useLocals();
        // init.applicationRouting();
        // init.serverStatus();
        // init.catchErrors();
        // init.clearPeriodicCache();
  var periodic_configure_obj={
    db : db,
    dburl : dburl,
    mngse : mngse,
    database : database,
    periodicConfigOptions : periodicConfigOptions,
    Config : Config,
    application_settings : application_settings,
    appconfig : appconfig,
    periodicObj: periodicObj,
    extension_helper: extension_helper,
    customThemeView : customThemeView,
    app : app,
    AppLog: AppLog,
    expressAppLogger: expressAppLogger,
    logger: logger
  };
exports.useLogger = function (options,callback) {
   winston logger instance based on  configuration settings in content/config/logger.js
   * @instance
  
  try{
    let logger = options.logger;
    let AppLog = options.AppLog;
    let app = options.app;
    fs.ensureDir(path.join(process.cwd(),'logs'),(err)=>{
      logger = new AppLog(app.get('env'));
      process.on('uncaughtException', function (err) {
        logger.error(err.message,err.stack,{
          err:err
        });
      });
      process.on('warning', err => {
        logger.warn(err.message, err.stack);
      });
      process.on('unhandledRejection', (reason, p) => {
        if(reason.message && reason.stack){
          logger.error(reason.message,reason.stack,{
            reason:err
          });
        }
        else{
          logger.error('unhandledRejection',reason);
        }
        console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
      });
      options.logger = logger;
      options.AppLog = AppLog;
      options.app = app;
      callback(err,options);
    });
  }
  catch(e){
    callback(e);
  }
};


exports.appLogging = function (options,callback) {
  try{
    let app = options.app;
    let application_settings = options.application_settings;
    let expressAppLogger = options.expressAppLogger;

    if (application_settings.debug) {
      expressAppLogger.token('colorstatus', function (req, res) {
        var color = 32; // green
        var status = res.statusCode;

        if (status >= 500) {
          color = 31;
        } // red
        else if (status >= 400) {
          color = 33;
        } // yellow
        else if (status >= 300) {
          color = 36;
        } // cyan
        return '\x1b[' + color + 'm' + status + '\x1b[90m';
      });
      expressAppLogger.format('app', '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m');
      if (application_settings.status !== 'install') {
        app.use(expressAppLogger( 'app', 
          {
            format:'\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
          }
        ));
      }
      else {
        app.use(expressAppLogger( 'app', 
          {
            format:'\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
          }
        ));
      }
    }

    options.expressAppLogger = expressAppLogger;
    options.application_settings = application_settings;
    options.app = app;
    callback(null,options);
  }
  catch(e){
    callback(e);
  }
};
 */

module.exports = {
  configureLogger,
  catchProcessErrors,
};