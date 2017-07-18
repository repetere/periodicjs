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
    name: 'Periodic Rapid Enterprise Application Framework',
    application: {
      environment: 'development',
      cluster_process: false,
      exit_on_invalid_extensions: false,
      // number_of_clusters:8, //defaults to number of CPU cores
      check_for_updates: true,
      check_for_outdated_extensions: true,
      version: packageJson.version,
      server: {
        http: {
          port: 8786,
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
        csrf: true,
        skip_csrf_header: 'clientid',
        upload_directory: 'public/uploads/files',
        asset_core_data: 'standard_asset',
      },
      views: {
        template_engine: 'ejs',
        lru_cache: true,
        lru: 100,
        engine: 'ejs',
        package: 'ejs',
        extension: 'ejs',
        page_data: {
          title: 'Web Application',
          version: packageJson.version,
          description: 'Periodic is an enterprise information and content management system, designed to quickly implement your own information architecture. Periodic defines a lightweight application wrapper for Express, that provides a simple mechanism to handle theming, routes and extensions. Unlike some traditional content management solutions, there are no assumptions made about your data model, which allows for information hierarchies and taxonomies to be extremely malleable.',
          keywords: 'content management framework, typeset, wysiwyg, ui manager, CMS, CDS, Express, ExpressJS, Application Framework, Micro Framework, Node CMS, wordpress, drupal, modular,Content Delivery System, Content Management System, Periodic Decoupled Framework',
          author: 'acme co',
        },
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
          limit: '1mb',
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
      },
      routing: {
        data: '/data',
        extension: '/ext',
        container: '/',
      },
    },
    periodic: {
      version: packageJson.version,
      emails: {
        server_from_address: 'Local Perodic App <hello@localhost>',
        notification_address: 'Local Perodic App <hello@localhost>',
      },
    },
    databases: {
      standard: {
        // db: 'mongoose',
        // options: {
        //   url: 'mongodb://localhost:27017/periodic10_test_standard',
        //   mongoose_options: {},
        // },

        db: 'lowkie',
        options: {
          dbpath: 'content/data/db/standard_db.json',
          dboptions: {
            verbose: true,
          },
        },

        // db: 'sequelize',
        // options: {
        //   database: 'travis_ci_test',
        //   username: '',
        //   password: '',
        //   connection_options: {
        //     dialect: 'postgres',
        //     port: 5432,
        //     host: '127.0.0.1',
        //     // logging: true,
        //   },
        // },

        controller: {
          default: {
            protocol: {
              adapter: 'http',
              api: 'rest',
            },
            responder: {
              adapter: 'json',
            },
          },
        },
        router: {
          ignore_models: [],
        },
      },
    },
    core: {
      mailer: {
        transport_config: {
          type: 'stub',
          transportoptions: {
            debug: true,
            args: ['-t', '-i']
          }
        }
      }
    },
    extensions: {},
    container: {
      name: 'periodicjs.container.default',
      type: 'local',
    },
  };
};