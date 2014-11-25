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

var run_cmd = function (cmd, args, callback,env) {
	var spawn = require('child_process').spawn;
	// console.log('env',env);
	if(env){
		var child = spawn(cmd, args, env);		
	}
	else{
		var child = spawn(cmd, args);		
	}
	// var resp = '';

	child.stdout.on('error', function (err) {
		console.error(err);
		process.exit(0);
	});
	child.stdout.on('data', function (buffer) {
		console.log(buffer.toString());
	});
	child.stderr.on('data', function (buffer) {
		console.error(buffer.toString());
	});
	//  child.stdout.on('end', function() {
	// console.log('got stdout end callback');
	// callback(null,"command run: "+cmd+" "+args);
	//  });
	//  child.stderr.on('end', function() {
	// console.log("got stderr end callback");
	// callback(null,"command run: "+cmd+" "+args);
	//  });
	child.on('exit', function () {
		callback(null, 'command run: ' + cmd + ' ' + args);
		process.exit(0);
	}); 
};

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
				run_cmd( 'pm2', ['deploy',path.resolve(process.cwd(),'content/config/deployment/ecosystem.json'),argv.deploy], function(err,text) { console.log (text) });
			}
			catch (e) {
				logger.error(e);
				logger.error(e.stack);
				process.exit(0);
			}
		}
		else if (argv.startpm2) {
			try {
				run_cmd( 'pm2', ['start',path.resolve(process.cwd(),'content/config/process/'+argv.startpm2+'.json')], function(err,text) { console.log (text) });
			}
			catch (e) {
				logger.error(e);
				logger.error(e.stack);
				process.exit(0);
			}
		}
		else if (argv.nd) {
			try {
				var processEnv = process.env;
				if(typeof argv.e !=='boolean'){
					processEnv.NODE_ENV = argv.e;
				}

				run_cmd( 
					'nodemon', 
					['index.js'], 
					function(err,text) { console.log (text) }, 
					{env: processEnv}
				);
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

	if (argv.nd){
		loadScript(argv);
	}
	else{
		init(argv);
	}
};

module.exports = cli;
