'use strict';

var path = require('path'),
	async = require('async'),
	merge = require('utils-merge'),
	appController = require('../../../../app/controller/application'),
	// Post,
	// Collection,
	mongoose,
	logger,
	appSettings,
	applicationController;

var extscript = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	// Post = mongoose.model('Post');
	// Collection = mongoose.model('Collection');
	var cli = function(argv){
		console.log("sample extension",argv);
		process.exit(0);
	};

	return{
		cli:cli
	}
};

module.exports = extscript;