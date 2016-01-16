'use strict';

var mongoose = require('mongoose');

module.exports = {
	'test':{
		url: 'mongodb://localhost:27017/periodic_test',
		mongoose: mongoose,
		mongooptions:{}
	},
	'development':{
		url: 'mongodb://localhost:27017/periodic_development',
		mongoose: mongoose,
		mongooptions:{}
	},
	'qa':{
		url: 'mongodb://localhost:27017/periodic_qa',
		mongoose: mongoose,
		mongooptions:{}
	},
	'staging':{
		url: 'mongodb://localhost:27017/periodic_staging',
		mongoose: mongoose,
		mongooptions:{}
	},
	'production':{
		url: 'mongodb://localhost:27017/periodic_production',
		mongoose: mongoose,
		mongooptions:{}
	}
};