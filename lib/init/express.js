'use strict';

const path = require('path');
const express = require('express');
const EJS = require('ejs');
const LRU = require('lru-cache');
const responseTime = require('response-time');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const compress = require('compression');
const morgan = require('morgan');
const connectLoki = require('connect-loki');
const connectMongo = require('connect-mongo');
const connectSql = require('connect-sequelize');
const connectRedis = require('connect-redis');
const session = require('express-session');

/**
 * configure express view rendering options
 * 
 * @returns {Promise}
 */
function configureViews() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.express.config.trust_proxy) {
        this.app.enable('trust proxy');
      }
      this.app.set('view engine', this.settings.express.views.engine || 'ejs');
      this.app.set('views', path.resolve(this.config.app_root, 'app/views'));
      if (this.settings.express.views.lru_cache) {
        EJS.cache = LRU(this.settings.express.views.lru);
      }
      this.app.engine('html', EJS.renderFile);
      this.app.engine('ejs', EJS.renderFile);
      if (this.settings.express.views.engine !== 'ejs') {
        this.app.engine(this.settings.express.views.engine, require(this.settings.express.views.package).renderFile);
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function configureExpress() {
  return new Promise((resolve, reject) => {
    try {
      this.app.use(responseTime(this.settings.express.response_time));
      if (this.settings.express.use_flash) {
        this.app.use(flash());
      }
      this.app.use(bodyParser.urlencoded(this.settings.express.body_parser.urlencoded));
      this.app.use(bodyParser.json(this.settings.express.body_parser.json));
      this.app.use(methodOverride());
      this.app.use(methodOverride('_method'));
      this.app.use(methodOverride('X-HTTP-Method'));
      this.app.use(cookieParser(this.settings.express.cookies.cookie_parser));
      this.app.use(favicon(path.resolve(this.config.app_root, 'public/favicon.png')));

      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function customizeExpress() {
  return new Promise((resolve, reject) => {
    try {
      const startup = require(path.join(this.config.app_root, 'content/config/startup.js'));
      resolve(startup.customExpressConfiguration.call(this));
    } catch (e) {
      reject(e);
    }
  });
}

function staticCacheExpress() {
  return new Promise((resolve, reject) => {
    try {
      const expressStaticOptions = (this.settings.express.config.use_static_caching) ? {
        maxAge: 86400000
      } : {};
      this.app.use(express.static(path.resolve(this.config.app_root, 'public'), expressStaticOptions));
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function compressExpress() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.express.config.use_compression) {
        this.app.use(compress());
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function morganColors(req, res) {
  const status = res.statusCode;
  let color = 32; // green

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
};

function logExpress() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.express.config.debug) {
        morgan.token('colorstatus', morganColors);
        morgan.format('app', '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m');
        // if (this.settings.application.status !== 'install') {
        this.app.use(morgan('app', {
          format: '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
        }));
        // } else {
        //   app.use(morgan('app', {
        //     format: '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
        //   }));
        // }
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function skipSessions(options) {
  const { req, } = options;
  if (req.headers.authorization) {
    return true;
  } else if (req.query && req.query.skip_session && (req.query.skip_session === 'true' || req.query.skip_session === true)) {
    return true;
  } else if (req.controllerData && req.controllerData.skip_session && (req.controllerData.skip_session === 'true' || req.controllerData.skip_session === true)) {
    return true;
  } else {
    return false;
  }
}

function expressSessions() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.express.sessions.enabled) {
        const express_session_config = Object.assign({
          proxy: true,
          // name:'connect.id',
          resave: false, //true, //default
          // rolling:false, //default
          saveUninitialized: false, //true, //default
          // secret:'somescreted', //default
          // store:MemoryStore //default
          // unset:'keep' //default
          cookie: {
            expires: 604800000, //one week
            maxAge: 604800000, //one week
            secure: 'auto',
          },
        }, this.settings.express.sessions.config);
        // let store;
        switch (this.settings.express.sessions.type) {
          case 'loki':
            var LokiStore = connectLoki(session);
            express_session_config.store = new LokiStore(this.settings.express.sessions.store_settings);
            break;
          case 'mongo':
            var MongoStore = connectMongo(session);
            express_session_config.store = new MongoStore(this.settings.express.sessions.store_settings);
            break;
          case 'sql':
            var SequeliezeStore = connectSql(session);
            express_session_config.store = new SequeliezeStore(this.settings.express.sessions.store_settings);
            break;
          case 'redis':
            var RedisStore = connectRedis(session);
            express_session_config.store = new RedisStore(this.settings.express.sessions.store_settings);
            break;
          default:
            reject(new Error('Invalid express session type'));
            break;
        }
        const sessionMiddleware = session(express_session_config);
        this.app.use((req, res, next) => {
          if (skipSessions({ req })) {
            return next();
          } else {
            return sessionMiddleware(req, res, next);
          }
        });
        if (this.settings.express.config.csrf) {
          this.app.use(csrf());
        }
        resolve(true);
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function useCSRFMiddleware(req, res, next) {
  res.locals.token = (this.settings.express.config.csrf) ?
    req.csrfToken() :
    '';
  next();
}

function useLocalsMiddleware(req, res, next) {
  res.locals.additionalHeadHTML = {};
  res.locals.additionalFooterHTML = {};
  res.locals.additionalPreContentHTML = {};
  res.locals.additionalPostContentHTML = {};
  res.locals['x-forwarded-for'] = req.headers['x-forwarded-for'];
  res.locals.remoteAddress = req.connection.remoteAddress;
  this.app.locals.isLoggedIn = function(isloggedinoptions) {
    if (isloggedinoptions) {
      console.log(isloggedinoptions);
    }
    return req.user;
  };
  next();
}

function expressLocals() {
  return new Promise((resolve, reject) => {
    try {
      // this.app.locals = require('./viewHelper');
      this.app.locals.appenvironment = this.environment;
      this.app.locals.appname = this.settings.name;
      this.app.locals.additionalHTMLFunctions = [];
      this.app.use(useCSRFMiddleware.bind(this));
      this.app.use(useLocalsMiddleware.bind(this));
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function expressRouting() {
  return new Promise((resolve, reject) => {
    /**
     *let app = options.app;
    let application_settings = options.application_settings;
    let periodicObj = options.periodicObj;
    let logger = options.logger;
    let mngse = options.mngse;
    let db = options.db;
    let extension_helper = options.extension_helper;
    let periodicConfigOptions = options.periodicConfigOptions;
    let customized_standard_model_path = path.resolve(__dirname, '../../content/config/model/standard_models.js');
    let customSchema = (fs.existsSync(customized_standard_model_path)) ? require(customized_standard_model_path)(periodicObj) : {};

    periodicObj = {
      express: express,
      app: app,
      logger: logger,
      settings: application_settings,
      db: db,
      mongoose: mngse,
      custom_standard_models: customSchema
    };
    periodicObj.app.controller ={
      native:{},
      extension:{}
    };
    if(periodicConfigOptions && periodicConfigOptions.skiprouting){
      if(application_settings.debug){
        logger.silly('skipping routing',periodicConfigOptions.skiprouting);
      }
    }
    else{
      if ( periodicConfigOptions!=='undefined' && typeof periodicConfigOptions.skip_install_check!=='undefined' && periodicConfigOptions.skip_install_check===true){
        periodicObj = require('../routes/index')(periodicObj);
      }
      else if (fs.existsSync(path.resolve(__dirname, '../../node_modules/periodicjs.ext.install')) && application_settings.status === 'install') {
        periodicObj = require('periodicjs.ext.install')(periodicObj);
      }
      else {
        periodicObj = require('../routes/index')(periodicObj);
        extension_helper = require('./extensionhelper')(periodicObj);
        extension_helper.useCronTasks();
      }
    }
    options.periodicConfigOptions = periodicConfigOptions;
    options.extension_helper = extension_helper;
    options.periodicObj = periodicObj;
    options.mngse = mngse;
    options.application_settings = application_settings;
    options.app = app;
     */
    resolve(true);
  });
}

function checkLatestPeriodicVersion() {
  request
    .get('https://registry.npmjs.org/periodicjs')
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (res && res.error) {
        this.logger.warn(res.error);
      }
      if (err) {
        this.logger.warn('Could not check latest version of Periodic - ', err);
      } else {
        var latestPeriodicVersion = res.body['dist-tags'].latest;
        if (semver.gte(application_settings.version, latestPeriodicVersion)) {
          if (application_settings.debug) {
            this.logger.debug('Your instance of Periodicjs ' + application_settings.version + ' is up to date with the current version ' + latestPeriodicVersion);
          }
        } else {
          console.log('\u0007');
          this.logger.debug('====================================================');
          this.logger.debug('|                                                  |');
          this.logger.debug('| Your instance of Periodic is out of date.        |');
          this.logger.debug('| Your Version: ' + application_settings.version + ', Current Version: ' + latestPeriodicVersion + '      |');
          this.logger.debug('|                                                  |');
          this.logger.debug('====================================================');
        }
      }
    });
}

function expressStatus() {
  return new Promise((resolve, reject) => {
    try {
      if (this.config.debug) {
        this.logger.debug(`Running in environment: ${this.environment}`);
      }
      if (this.settings.application.check_for_updates) {
        checkLatestPeriodicVersion.call(this);
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function expressErrors() {
  return new Promise((resolve, reject) => {
    /**
     *		let customThemeView = options.customThemeView;

    //log errors
    app.use(function (err, req, res, next) {
      // console.log('err',err,'next',next);
      var userdata = {};		
      if (req && req.user && req.user.email) {		
        userdata = {		
          email:req.user.email,		
          username:req.user.username,		
          firstname:req.user.firstname,		
          lastname:req.user.lastname		
        };		
      }
      logger.error(err.message,err.stack,{
        err:err,
        ipinfo:{
          date: new Date(),
          'x-forwarded-for': req.headers['x-forwarded-for'],
          remoteAddress: req.connection.remoteAddress,
          originalUrl: req.originalUrl,
          headerHost: req.headers.host,
          userAgent: req.headers['user-agent'],
          referer: req.headers.referer,
          user: userdata,
          osHostname: os.hostname()
        }
      });
      // logger.error(err.stack);
      next(err);
    });

    //send client errors
    //catch all errors
    app.use(function (err, req, res, next) {
      if(!err){
        next();
      }
      else if (req.query.format==='json' || req.is('json') || req.is('application/json')) {
        res.status(500);
        res.send({
          error: err
        });
      }
      else  {
        res.status(500);
        res.render(customThemeView, {
          user: req.user,
          message: err.message,
          error: err
        });
      }
    });

     */
    resolve(true);
  });
}

/**
 * sets the runtime environment correctly
 * 
 * @returns {Promise} configRuntimeEnvironment sets up application config db
 */
function initializeExpress() {
  return Promise.all([
    configureViews.call(this),
    configureExpress.call(this),
    customizeExpress.call(this),
    staticCacheExpress.call(this),
    compressExpress.call(this),
    logExpress.call(this),
    expressSessions.call(this),
    expressLocals.call(this),
    // expressRouting.call(this),
    // expressStatus.call(this),
    // expressErrors.call(this),
  ]);
}
module.exports = {
  initializeExpress,
  configureViews,
  configureExpress,
  customizeExpress,
  staticCacheExpress,
  compressExpress,
  logExpress,
  expressSessions,
  expressLocals,
  expressRouting,
  expressStatus,
  expressErrors,
  morganColors,
};