/*
 * periodicjs
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const extend = require('utils-merge');
// const http = require('http');

/**
 * @description loads the periodic configuration options
 */
exports.loadCustomStartupConfigurations = function (options,callback) {
	try{
		let periodicStartupOptions = options.periodicStartupOptions;

		global.periodicExpressApp ={};
		/**
		 * @description the script that starts the periodic express application.
		 * @author Yaw Joseph Etse
		 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
		 * @license MIT
		 * @requires module:optimist
		 */

		if(periodicStartupOptions.use_global_socket_io){
			global.io = require('socket.io')();
		}

		options.periodicStartupOptions = periodicStartupOptions;
		callback(null,options);
	}
	catch(err){
		callback(err);
	}
};

exports.useCLI = function (options,callback) {
	try{
		let argv = options.argv;

		if (argv.cli) {
			require('./app/lib/cli')(argv);
		}
		else{
			options.argv = argv;
			callback(null,options);
		}
	}
	catch(err){
		callback(err);
	}
};

exports.setupPeriodicSettings = function (options,callback) {
	/**
	 * @description periodic express application
	 * @instance express app
	 * @global
	 * @type {object}
	 */
	try{
		let periodicStartupOptions = options.periodicStartupOptions;
		let libPeriodic = require('./periodic')(periodicStartupOptions);
		libPeriodic.init({},function(err,periodicInitialized){
		let periodic = periodicInitialized;
		let periodicSettings = periodic.appconfig.settings();
		let server_options = options.server_options;
		if(periodicSettings.application.https_port){
      server_options.key = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_privatekey));
      server_options.ca = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_certauthority));
      server_options.cert = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_certificate));
		}
		options.periodic = periodic;
		options.server_options = server_options;
		options.periodicSettings = periodicSettings;
		options.periodicStartupOptions = periodicStartupOptions;
		options.libPeriodic = libPeriodic;
		callback(null,options);
	});
	}
	catch(err){
		callback(err);
	}
};

exports.startWebServer = function (options, callback){
	try{
		let argv = options.argv;
		let periodicSettings = options.periodicSettings;
		let periodic = options.periodic;
		let server_options = options.server_options;

		if(argv.waitformongo || (periodicSettings && periodicSettings.waitformongo)){
			periodic.mongoose.connection.on('open',function(){
				global.periodicExpressApp = periodic.expressapp.listen(periodic.port,function(){
					console.log('HTTP Server listening on port',periodic.port);
				});
			});	
			if(periodicSettings.application.https_port){
				global.periodicHTTPSExpressApp = https.createServer(server_options,periodic.expressapp).listen(periodicSettings.application.https_port);
					console.log('HTTPS Server listening on port',periodic.port);
			}
		}
		else{
			global.periodicExpressApp = periodic.expressapp.listen(periodic.port);
			if(periodicSettings.application.https_port){
				global.periodicHTTPSExpressApp = https.createServer(server_options,periodic.expressapp).listen(periodicSettings.application.https_port);
			}
		}

		options.server_options = server_options;
		options.periodic = periodic;
		options.periodicSettings = periodicSettings;
		options.argv = argv;
		callback(null,options);
		
	}
	catch(err){
		callback(err);
	}
};

exports.useSocketIO = function(options, callback){
	try{
		let periodicStartupOptions = options.periodicStartupOptions;
		let periodicSettings = options.periodicSettings;
		let periodic = options.periodic;

		if(periodicStartupOptions.use_global_socket_io){
			if(periodicSettings.socketio_type && periodicSettings.socketio_type==='redis'){
				var redisIoAdapater = require('socket.io-redis');
				var redis_config_obj = periodicSettings.redis_config;
				if((!periodicSettings.redis_config.port || !periodicSettings.redis_config.host) ){
					var redis_url = require('redis-url');
					redis_config_obj = extend(redis_config_obj,redis_url.parse(periodicSettings.redis_config.url));
				}
				if(redis_config_obj.pass || redis_config_obj.password){
					if(redis_config_obj.password){
						redis_config_obj.pass = redis_config_obj.password;
					}
					var redis = require('redis').createClient;
					var pub = redis(redis_config_obj.port, redis_config_obj.host, { auth_pass: redis_config_obj.pass });
					var sub = redis(redis_config_obj.port, redis_config_obj.host, { return_buffers: true, auth_pass: redis_config_obj.pass });
					global.io.adapter(redisIoAdapater({ pubClient: pub, subClient: sub }));
				}
				else{
					global.io.adapter(redisIoAdapater({ host: redis_config_obj.host, port: redis_config_obj.port }));				
				}
			}
			else{
				var mongoIoAdapter = require('@yawetse/socket.io-adapter-mongo'),
					additionalIOConfigs = { return_buffers: true, detect_buffers: true };
				global.io.adapter(mongoIoAdapter(periodicSettings.dburl,additionalIOConfigs));
			}
			global.io.attach(global.periodicExpressApp, {
				logger: periodic.logger
			});
			if(periodicSettings.application.https_port){
				global.io.attach(global.periodicHTTPSExpressApp, {
					logger: periodic.logger
				});
			}
		}
	

		options.periodic = periodic;
		options.periodicSettings = periodicSettings;
		options.periodicStartupOptions = periodicStartupOptions;
		callback(null,options);
	}
	catch(err){
		callback(err);
	}
};
