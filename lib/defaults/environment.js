'use strict';

/**
 * exports default application settings
 *@return {object} default application settings
 */
module.exports = () => {
  return {
    name: "Periodic Rapid Enterprise Application Framework",
    application: {
      port: "8786",
      environment: "development"
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