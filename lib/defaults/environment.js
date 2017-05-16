'use strict';
const fs = require('fs-extra');
const path = require('path');
/**
 * exports default application settings
 *@return {object} default application settings
 */
module.exports = () => {
  const packageJson = fs.readJSONSync(path.resolve(__dirname, '../../package.json'));
  // console.log({ packageJson });
  return {
    name: "Periodic Rapid Enterprise Application Framework",
    application: {
      environment: "development",
      cluster_process: false,
      // number_of_clusters:8, //defaults to number of CPU cores
      check_for_updates: true,
      version: packageJson.version,
      server: {
        http: {
          port: 8786
        },
        https: {
          port: 8787, //https://www.ibm.com/support/knowledgecenter/en/SSWHYP_4.0.0/com.ibm.apimgmt.cmc.doc/task_apionprem_gernerate_self_signed_openSSL.html
          ssl: {
            private_key: 'node_modules/periodicjs/lib/defaults/demo/certs/2017.testperiodic.ssl_key.pem',
            // p12:'node_modules/periodicjs/lib/defaults/demo/certs/2017.testperiodic.ssl_key.p12',
            // pfx:'node_modules/periodicjs/lib/defaults/demo/certs/2017.testperiodic.ssl_key.pfx',
            certificate: 'node_modules/periodicjs/lib/defaults/demo/certs/2017.testperiodic.ssl_cert.pem',
          },
        },
        // socketio: {
        //   type: 'redis',
        //   config: {
        //     url:'localhost'
        //   }
        // },
      },
    },
    logger: {
      use_winston_logger: true,
      winston_exit_on_error: false,
      use_standard_logging: true,
      custom_logger_file_path: false,
      custom_logger_node_modules: [],
    },
    express: {
      config: {
        trust_proxy: true,
        use_static_caching: false, //should be true in production
        use_compression: true,
        debug: true,
      },
      views: {
        template_engine: 'ejs',
        lru_cache: true,
        lru: 100,
        engine: 'ejs',
        package: 'ejs',
        extension: 'ejs',
      },
      response_time: {
        digits: 5,
      },
      use_flash: true,
      body_parser: {
        urlencoded: {
          limit: '1mb',
          extended: true,
        },
        json: {
          limit: '1mb'
        },
      },
      cookies: {
        cookie_parser: 'defaultcookiejson',
      },
      sessions: {
        enabled: true,
        type: 'loki',
        config: {
          // name:'connect.id',
          proxy: true,
          resave: false, //true, //default
          // rolling:false,//default
          saveUninitialized: false, //true, //default
          secret: 'defaultsessionsecret',
          // store:Loki //default
          // unset:'keep' //default
          cookie: {
            // httpOnly:true,
            // domain:,//one week
            expires: 604800000, //one week
            maxAge: 604800000, //one week
            secure: 'auto',
            // path:'/',
            // sameSite:'strict',
          },
        },
      }
    },
    periodic: {
      version: packageJson.version,
    },
    // "sessions": {
    //   "enabled": true,
    //   "type": "default",
    //   "ttl_in_seconds": 86400,
    //   "ignore_session_with_api": true,
    //   "maxage_in_milliseconds": 3600000,
    //   "secure_cookie": {
    //     "secure": "auto",
    //     "httpOnly": true
    //   }
    // },
    // "periodic_cache_settings": {
    //   "prevent_clear_data_cache_on_start": false,
    //   "prevent_clear_view_cache_on_start": false
    // },
    // "template_lru_cache": true,
    // "cluster_process": false,
    // "periodic_cache_status": false,
    // "session_secret": "hjoiuu87go9hui",
    // "expressCompression": true,
    // "use_test_extensions_by_environment": false,
    // "templateengine": "ejs",
    // "templatepackage": "ejs",
    // "templatefileextension": "ejs",
    // "crsf": false,
    // "debug": true,
    // "status": "active",
    // "serverfromemail": "Local Perodic App <hello@localhost>",
    // "adminnotificationemail": "Local Perodic App <hello@localhost>"
  };
};