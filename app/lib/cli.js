'use strict';

var config = require('./config'),
	database = require('../../content/config/database'),
	appLog = require('../../content/config/logger'),
	logger,
	db,
	mongoose,
	periodicResources,
	appconfig;

var cli = function(argv){
	var models,
		periodic = {};

	var loadConfig = function(){
		appconfig = new config();
		db = database[appconfig.settings().application.environment];
		mongoose = db.mongoose;
	};
	var useLogger = function(){
		logger = new appLog(appconfig.settings().application.environment);
		periodic.logger = logger;
		process.on('uncaughtException',function(err){
			logger.error(err.message);
		});
	};
	var setupMongoDB = function(){
		models = require('../../content/config/model')({
			mongoose : db.mongoose,
			dburl: db.url,
			debug: appconfig.settings().debug,
			periodic: periodic
		});
	};
	var setResources = function(){
		periodicResources = {
			logger:logger,
			settings:appconfig.settings(),
			db:db,
			mongoose:mongoose
		};
	};
	var loadScript = function(argv){
		if(argv.controller){
			var cliController = require('../controller/'+argv.controller)(periodicResources);
			cliController.cli(argv);
		}
		else if(argv.extension){
			logger.silly(argv.extension);
			console.log("in cli",argv);
			process.exit(0);
		}
		// var Post = mongoose.model('Post');
		// Post.find({}).limit(2).exec(function(err,posts){ if(err){ console.error(err); } else{ console.info(posts); } });
		// process.exit(0);
	};

	var init = function(argv){
		loadConfig();
		useLogger();
		setupMongoDB();
		mongoose.connection.on("open",function(){
			setResources();
			loadScript(argv);
		});
	};

	init(argv);
};

module.exports = cli;