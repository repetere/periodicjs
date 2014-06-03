'use strict';

var mongoose = require('mongoose');

module.exports = {
	"development":{
		url: 'mongodb://localhost:27017/periodic_dev',
		db: mongoose.createConnection('mongodb://localhost:27017/periodic_dev')
	},
	"production":{
		url: 'mongodb://localhost:27017/periodic_prod',
		db: mongoose.createConnection('mongodb://localhost:27017/periodic_prod')
	}
};