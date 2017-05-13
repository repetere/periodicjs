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

function logExpress() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.express.config.debug) {
        morgan.token('colorstatus', function(req, res) {
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
        morgan.format('app', '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m');
        if (application_settings.status !== 'install') {
          app.use(morgan('app', {
            format: '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
          }));
        } else {
          app.use(morgan('app', {
            format: '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
          }));
        }
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function expressSessions() {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function expressLocals() {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function expressRouting() {
  this.logger.silly('expressRouting');

  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function expressStatus() {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function expressErrors() {
  this.logger.silly('expressErrors');

  return new Promise((resolve, reject) => {
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
    // compressExpress.call(this),
    // logExpress.call(this),
    // expressSessions.call(this),
    // expressLocals.call(this),
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
};