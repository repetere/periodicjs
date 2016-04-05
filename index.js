/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */
'use strict';

const Promisie = require('promisie');
const extend = require('utils-merge');
const	argv = require('optimist').argv;
var index_startup = require('./app/lib/index_startup');
var periodicStartupOptions = require('./content/config/startup');
var periodic;
var cluster = require('cluster');
var periodicSettings;
var server_options = {};
var libPeriodic = {};
var init=index_startup;


periodicStartupOptions = extend(periodicStartupOptions,argv);


if(periodicStartupOptions.index_startup){
	console.log('using custom initializing');
	init = extend(index_startup,periodicStartupOptions.index_startup);
}

var periodic_configure_obj={
	periodicStartupOptions : periodicStartupOptions,
	argv: argv,
	libPeriodic: libPeriodic,
	periodic: periodic,
	periodicSettings: periodicSettings,
	server_options: server_options,
	cluster: cluster
};

Promisie.promisify(init.loadCustomStartupConfigurations)(periodic_configure_obj)
	.then((loadconfiguration_return_object)=>Promisie.promisify(init.useCLI)(loadconfiguration_return_object))
	.then((cli_return_object)=>Promisie.promisify(init.setupPeriodicSettings)(cli_return_object))
	.then((setupperiodic_return_object)=>Promisie.promisify(init.startWebServer)(setupperiodic_return_object))
	.then((startwebserver_return_object)=>Promisie.promisify(init.useSocketIO)(startwebserver_return_object))
	.then((intialized_return_object)=>{
		console.log('initialized Periodic',Object.keys(intialized_return_object));
	})
	.catch((e)=>{
		if(e.message==='Leave Promise Chain: CLI Process' || e.message==='Leave Promise Chain: Forking Process'){
			console.log(e.message);
		}
		else{
			console.error('Could not initialize Periodic');
			console.error(e.stack);
		}
	});
