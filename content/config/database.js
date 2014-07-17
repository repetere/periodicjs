"use strict";

var mongoose = require("mongoose");

module.exports = {
	"development":{
		url: "mongodb://localhost:27017/periodicjs_development",
		mongoose: mongoose,
		mongooptions:{}
	},
	"production":{
		url: "mongodb://localhost:27017/periodicjs_development",
		mongoose: mongoose,
		mongooptions:{}
	}
};
