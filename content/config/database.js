'use strict';

var mongoose = require('mongoose');

module.exports = {
	'development':{
		url: 'mongodb://localhost:27017/periodic_dev',
		mongoose: mongoose,
		mongooptions:{}
	},
	'production':{
		url: 'mongodb://localhost:27017/periodic_prod',
		mongoose: mongoose,
		mongooptions:{}
	}
};