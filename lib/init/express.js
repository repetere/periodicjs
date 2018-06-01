'use strict';

require('isomorphic-fetch');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const express = require('express');
const Sequelize = require('sequelize');
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
const csrf = require('csurf');
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
      this.app.use(methodOverride('X-HTTP-Method')); // Microsoft 
      this.app.use(methodOverride('X-HTTP-Method-Override')); // Google/GData 
      this.app.use(methodOverride('X-Method-Override')); // IBM  
      this.app.use(methodOverride(function(req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
          // look in urlencoded POST bodies and delete it 
          const method = req.body._method;
          delete req.body._method;
          return method;
        }
      }));
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
        maxAge: 86400000,
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
}

function logExpress() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.express.config.debug) {
        morgan.token('colorstatus', morganColors);
        morgan.format('app', '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m');
        // if (this.settings.application.status !== 'install') {
        this.app.use(morgan('app', {
          format: '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m',
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

function enabledSessionMiddleware(sessionMiddleware) {
  return (req, res, next) => {
    // console.log('skipSessions({ req })',skipSessions({ req }))
    if (skipSessions({ req, })) {
      return next();
    } else {
      return sessionMiddleware(req, res, next);
    }
  };
}

function enabledCSRFMiddleware(csrfMiddleware) {
  return (req, res, next) => {
    let skipSessionCheck = skipSessions({ req, });
    if (skipSessionCheck) {
      return next();
    } else if (Array.isArray(this.settings.express.config.skip_csrf_header)) {
      let skipCSRF = false;
      this.settings.express.config.skip_csrf_header.forEach(skipHeader => {
        if (req.headers[skipHeader]) {
          skipCSRF = true;
        }
      });
      if (skipCSRF || skipSessionCheck) {
        next();
      } else {
        return csrfMiddleware(req, res, next);
      }
    } else if (req.headers[this.settings.express.config.skip_csrf_header]) {
      return next();
    } else {
      return csrfMiddleware(req, res, next);
    }
  };
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
            var { db, options, modelName, } = this.settings.express.sessions.store_settings;
            var sqldb = new Sequelize(...db);
            express_session_config.store = new SequeliezeStore(sqldb, options, modelName);
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
        this.app.use(enabledSessionMiddleware(sessionMiddleware));
        const csrfMiddleWare = enabledCSRFMiddleware.bind(this);
        if (this.settings.express.config.csrf) {
          this.app.use(csrfMiddleWare(csrf()));
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
  res.locals.token = (this.settings.express.config.csrf && req.csrfToken) ?
    req.csrfToken() :
    '';
  next();
}

function useLocalsMiddleware(req, res, next) {
  res.locals.periodic_addons = {
    additionalHeadHTML: {},
    additionalFooterHTML: {},
    additionalPreContentHTML: {},
    additionalPostContentHTML: {},
    ['x-forwarded-for']: req.headers['x-forwarded-for'],
    remoteAddress: req.connection.remoteAddress,
  };
  res.locals.isLoggedIn = (req.user && Object.keys(req.user).length) ? true : false;
  next();
}

function expressLocals() {
  return new Promise((resolve, reject) => {
    try {
      this.app.locals.viewHelper = this.utilities.viewHelper;
      const useCSRFMiddlewareFunc = useCSRFMiddleware.bind(this);
      const useLocalsMiddlewareFunc = useLocalsMiddleware.bind(this);
      let core_data_list = [];
      for (let key of this.datas.keys()) {
        if (key !== 'configuration' && key !== 'extension') {
          core_data_list.push(key);
        }
      }
      this.app.locals.core_data_list = core_data_list.reduce(this.utilities.routing.splitModelNameReducer, {});
      this.app.locals.appenvironment = this.environment;
      this.app.locals.appname = this.settings.name;
      this.app.locals.additionalHTMLFunctions = [];
      this.app.use(useCSRFMiddlewareFunc);
      this.app.use(useLocalsMiddlewareFunc);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function expressRouting() {
  return new Promise((resolve, reject) => {
    try {
      this.app.locals.page_data = Object.assign({}, this.settings.express.views.page_data, this.app.locals.page_data);
      //assign container routers
      //assign extension routers
      //assign data routers
      this.routers.forEach((value /*, key*/ ) => {
        if (value.type === 'container') {
          this.app.use(value.router);
        } else if (value.type === 'extension') {
          this.app.use(value.router);
        } else if (value.type === 'data') {
          this.app.use(getDataRoute.call(this, value.router_base),
            value.router);
        }
        // else 
      });
      this.app.get('*', (req, res, next) => {
        const skippable_routes = this.settings.express.views.skippable_routes;
        const skip404 = skippable_routes.reduce((result, route) => {
          if (req.path.indexOf(route) >= 0) {
            result.push(route);
          }
          return result;
        }, []);

        if (skip404.length) {
          next();
        } else {
          const viewtemplate = 'home/error404';
          const viewdata = Object.assign({}, {
            periodic: {
              appname: this.settings.name,
              page_data: {
                version: this.settings.application.version,
              },
            },
            error: new Error('page not found'),
          }, this.app.locals);
          res.status(404);
          this.core.controller.renderView(req, res, viewtemplate, viewdata);
        }
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function getDataRoute(data_route) {
  return this.utilities.routing.route_prefix(path.join(this.settings.express.routing.data, data_route.replace(/_/gi, '/')));
}

function displayOutOfDatePeriodic(options) {
  const { latestPeriodicVersion, } = options;
  console.log('\u0007');
  this.logger.debug(`
  ======================================================
  |                                                    |
  |     Your instance of Periodic is out of date.      |
  |   Your Version: ${this.settings.application.version}, Current Version: ${latestPeriodicVersion}    |
  |                                                    |
  ======================================================
  `);
}

function handleLatestPeriodicVersionCheckError(error) {
  this.logger.warn('Could not check latest version of Periodic', error);
}

function extVersionReducer(result, key) {
  result[key.name] = key.version;
  return result;
}

function checkOutdatedExtensionVersions() {
  const extensionNamesToFetch = Array.from(this.extensions.keys()).filter(ext => ext.indexOf('@') < 0);
  const extensions = Array.from(this.extensions.values()).filter(ext => ext.name.indexOf('@') < 0);
  const semverRegEx = RegExp(/[^0-9.]/g);

  const registryExtensionFetchs = extensionNamesToFetch.map(extname => {
    return new Promise((resolve, reject) => {
      fetch(`https://registry.npmjs.org/${extname}`, {
          headers: {
            Accept: 'application/json',
          },
        })
        .then(this.utilities.fetchUtils.checkStatus)
        .then(res => res.json())
        .then(resolve)
        .catch(reject);
    });
  });
  const outOfDateExtensions = [];
  fs.readJson(path.join(this.config.app_root, 'package.json')).then(packageJSON => {
      const extensionVersionObj = Array.from(this.extensions.values()).reduce(extVersionReducer, {});
      Object.keys(extensionVersionObj).forEach(extVer => {
        if (packageJSON.dependencies[extVer]) {
          const packageJsonExtVer = packageJSON.dependencies[extVer].replace(semverRegEx, '').split('.').slice(0, 3).join('.');
          const extJsonVer = extensionVersionObj[extVer];
          if (this.utilities.fetchUtils.isVersionUpToDate(packageJsonExtVer, extJsonVer) === false) {
            this.logger.error(`${extVer}@${packageJsonExtVer} in package.json is out of date with version ${extJsonVer} in the configuration database`);
          }
        } else {
          this.logger.error(`${extVer}@${extensionVersionObj[extVer]} from the configuration database in missing in your package.json file`);
        }
      });
      return Promise.all(registryExtensionFetchs);
    })
    .then(extensionsFromNPM => {
      extensionsFromNPM.forEach((extFromNPM, i) => {
        const latestExtVersion = extFromNPM['dist-tags'].latest;
        if (this.utilities.fetchUtils.isVersionUpToDate(extensions[i].version, latestExtVersion) === false) {
          outOfDateExtensions.push({
            name: extensions[i].name,
            installed: extensions[i].version,
            latest: latestExtVersion,
          });
        }
      });
      if (outOfDateExtensions.length) {
        this.logger.verbose('Your current extensions are out of date: ', outOfDateExtensions);
      }
    })
    .catch(this.logger.error);
}

function checkLatestPeriodicVersion() {
  fetch('https://registry.npmjs.org/periodicjs', {
      headers: {
        Accept: 'application/json',
      },
    })
    .then(this.utilities.fetchUtils.checkStatus)
    .then(res => res.json())
    .then(res => {
      const latestPeriodicVersion = res['dist-tags'].latest;
      if (this.utilities.fetchUtils.isVersionUpToDate(this.settings.application.version, latestPeriodicVersion)) {
        if (this.config.debug) {
          this.logger.debug(`Your version of Periodic[${this.settings.application.version}] is up to date with the current version [${latestPeriodicVersion}]`);
        }
      } else {
        displayOutOfDatePeriodic.call(this, { latestPeriodicVersion, });
      }
    })
    .catch(handleLatestPeriodicVersionCheckError.bind(this));
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
      if (this.settings.application.check_for_outdated_extensions) {
        checkOutdatedExtensionVersions.call(this);
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

const errorLogMiddleware = function errorLogMiddleware(err, req, res, next) {
  // console.log('err', err, 'next', next);
  var userdata = {};
  if (req && req.user && req.user.email) {
    userdata = {
      email: req.user.email,
      username: req.user.username,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
    };
  }
  this.logger.error(err.message, err.stack, {
    err: err,
    ipinfo: {
      date: new Date(),
      'x-forwarded-for': req.headers['x-forwarded-for'],
      remoteAddress: req.connection.remoteAddress,
      originalUrl: req.originalUrl,
      headerHost: req.headers.host,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      user: userdata,
      osHostname: os.hostname(),
    },
  });
  // logger.error(err.stack);
  next(err);
};

const catchAllErrorMiddleware = function catchAllErrorMiddleware(err, req, res, next) {
  if (!err) {
    next();
  } else if (req.query.format === 'json' || req.is('json') || req.is('application/json')) {
    res.status(500);
    res.send({
      result: 'error',
        data: {
        error:err.toString()
      },  
      error: err,
    });
  } else {
    res.status(500);
    res.render(this.settings.express.views.custom_error_view || 'home/error500', {
      user: req.user,
      message: err.message,
      error: err,
    });
  }
};

function expressErrors() {
  return new Promise((resolve, reject) => {
    try {
      const catchAllErrorMiddlewareFunc = catchAllErrorMiddleware.bind(this);
      const errorLogMiddlewareFunc = errorLogMiddleware.bind(this);
      this.app.use(errorLogMiddlewareFunc);
      this.app.use(catchAllErrorMiddlewareFunc);
      resolve(true);
    } catch (e) {
      reject(e);
    }
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
    expressRouting.call(this),
    expressStatus.call(this),
    expressErrors.call(this),
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
  errorLogMiddleware,
  catchAllErrorMiddleware,
  checkLatestPeriodicVersion,
  useLocalsMiddleware,
  useCSRFMiddleware,
  skipSessions,
  enabledCSRFMiddleware,
  enabledSessionMiddleware,
  handleLatestPeriodicVersionCheckError,
  displayOutOfDatePeriodic,
};