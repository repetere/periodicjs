/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */
'use strict';
var periodicStartupOptions = require('./content/config/startup'),
	extend = require('utils-merge'),
	argv = require('optimist').argv,
	periodicSettings;

periodicStartupOptions = extend(periodicStartupOptions,argv);

if(periodicStartupOptions.use_global_socket_io){
	global.io = require('socket.io')();
}
global.periodicExpressApp ={};
/**
 * @description the script that starts the periodic express application.
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:optimist
 */
if (argv.cli) {
	require('./app/lib/cli')(argv);
}
else {
	/**
	 * @description periodic express application
	 * @instance express app
	 * @global
	 * @type {object}
	 */
	var periodic = require('./app/lib/periodic')(periodicStartupOptions);
	periodicSettings = periodic.appconfig.settings();
	if(periodicSettings.application.https_port){
		var https = require('https'),
			fs = require('fs'), 
			path = require('path'), 
			server_options = {};
      server_options.key = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_privatekey));
      server_options.ca = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_certauthority));
      server_options.cert = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_certificate));
	}
	if(argv.waitformongo || (periodicSettings && periodicSettings.waitformongo)){
		periodic.mongoose.connection.on('open',function(){
			global.periodicExpressApp = periodic.expressapp.listen(periodic.port);
		});	
		if(periodicSettings.application.https_port){
			global.periodicHTTPSExpressApp = https.createServer(server_options,periodic.expressapp).listen(periodicSettings.application.https_port);
		}
	}
	else{
		global.periodicExpressApp = periodic.expressapp.listen(periodic.port);
		if(periodicSettings.application.https_port){
			global.periodicHTTPSExpressApp = https.createServer(server_options,periodic.expressapp).listen(periodicSettings.application.https_port);
		}
	}

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
}
