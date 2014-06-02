'use strict';

var mongoose = require('mongoose');

module.exports = {
	"development":{
		url: 'mongodb://localhost:27017/periodicwebapp',
		db: mongoose.connect('mongodb://localhost:27017/periodicwebapp')
	}
};