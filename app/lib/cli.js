'use strict';

var config = require('./config'),
	path = require('path'),
	database = require('../../content/config/database'),
	appLog = require('../../content/config/logger'),
	logger,
	db,
	mongoose,
	periodicResources,
	appconfig;
/**
 * A simple node script for running Command Line Argument based tasks from periodic controllers and extensions
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module cli
 * @requires module:./config
 * @requires module:path
 * @requires module:../../content/config/database
 * @requires module:../../content/config/logger
 * @param {object} argv command line arguments from optimist
 */
var cli = function (argv) {
	var models,
		periodic = {};
	/**
	 * @description loads the periodic configuration options
	 * @private
	 * @memberOf cli
	 */
	var loadConfig = function () {
		/** creates instance of configuration object
		 * @instance
		 */
		appconfig = new config();
		/** environment based database configuration
		 * @instance
		 */
		db = database[appconfig.settings().application.environment];
		appconfig.setSetting('dburl',db.url);
		/** instance of mongoose connection based on configuration settings in content/config/database.js
		 * @instance
		 */
		mongoose = db.mongoose;
		if (appconfig.settings().debug) {
			console.log(appconfig.settings());
		}
	};
	/**
	 * @description loads application logger configuration
	 */
	var useLogger = function () {
		/** winston logger instance based on  configuration settings in content/config/logger.js
		 * @instance
		 */
		logger = new appLog(appconfig.settings().application.environment);
		periodic.logger = logger;
		process.on('uncaughtException', function (err) {
			logger.error(err.message);
		});
	};
	var setupMongoDB = function () {
		/** load mongoose models
		 * @param {object} periodic the same instance configuration object
		 */
		models = require('../../content/config/model')({
			mongoose: db.mongoose,
			dburl: db.url,
			debug: appconfig.settings().debug,
			periodic: periodic
		});
	};
	var setResources = function () {
		/**
		 * @description application reference passed to controllers
		 * @instance
		 */
		periodicResources = {
			logger: logger,
			settings: appconfig.settings(),
			db: db,
			mongoose: mongoose
		};
	};
	var loadScript = function (argv) {
		if (argv.controller) {
			try {
				var cliController = require('../controller/' + argv.controller)(periodicResources);
				cliController.cli(argv);
			}
			catch (e) {
				logger.error(e);
				logger.error(e.stack);
				process.exit(0);
			}
		}
		else if (argv.extension) {
			try {
				var cliExtension = require(path.resolve(process.cwd(), './node_modules/periodicjs.ext.' + argv.extension + '/cli'))(periodicResources);
				cliExtension.cli(argv);
			}
			catch (e) {
				logger.error(e);
				logger.error(e.stack);
				process.exit(0);
			}
		}
		else if (argv.deploy) {
			try {
				var exec = require('child_process').exec,
					child;

				child = exec('pm2 deploy content/config/deployment/ecosystem.json '+argv.deploy+' ',
				function (error, stdout, stderr) {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
					  console.log('exec error: ' + error);
					}
  				process.exit(0);
				});
				// console.log(argv);
			}
			catch (e) {
				logger.error(e);
				logger.error(e.stack);
				process.exit(0);
			}
		}
		else if (argv.pm2) {
			try {
				var exec = require('child_process').exec,
					child;

				child = exec('pm2 start content/config/process/'+argv.pm2+'.json  ',
				function (error, stdout, stderr) {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
					  console.log('exec error: ' + error);
					}
  				process.exit(0);
				});
				// console.log(argv);
			}
			catch (e) {
				logger.error(e);
				logger.error(e.stack);
				process.exit(0);
			}
		}
		else if (argv.nd) {
			try {
				var exec = require('child_process').exec,
					child;

				child = exec('NODE_ENV='+argv.nd+' nodemon --watch app --watch content/extensions/restart.json --watch content/config/database.js index.js',
				function (error, stdout, stderr) {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
					  console.log('exec error: ' + error);
					}
  				process.exit(0);
				});
				// console.log(argv);
			}
			catch (e) {
				logger.error(e);
				logger.error(e.stack);
				process.exit(0);
			}
		}
		else {
			logger.error('no valid arguments', argv);
			process.exit(0);
		}
		//node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest
		//node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest
		// var Item = mongoose.model('Item');
		// Item.find({}).limit(2).exec(function(err,items){ if(err){ console.error(err); } else{ console.info(items); } });
	};

	var init = function (argv) {
		loadConfig();
		useLogger();
		setupMongoDB();
		mongoose.connection.on('open', function () {
			setResources();
			loadScript(argv);
		});
	};

	init(argv);
};

module.exports = cli;