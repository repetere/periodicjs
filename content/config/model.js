'use strict';
/**
 * A module that loads configurations for express and periodic.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module model
 * @exports	model
 * @param {object} options periodic instance configuration object, that has references to mongo, logging, etc
 */
module.exports = function(options){
	var mongoose = options.mongoose;
		mongoose.connect(options.dburl);
	var userSchema = require('../../app/model/user.js'),
		itemSchema = require('../../app/model/item.js'),
		collectionSchema = require('../../app/model/collection.js'),
		compilationSchema = require('../../app/model/compilation.js'),
		categorySchema = require('../../app/model/category.js'),
		assetSchema = require('../../app/model/asset.js'),
		contenttypeSchema = require('../../app/model/contenttype.js'),
		tagSchema = require('../../app/model/tag.js'),
		userroleSchema = require('../../app/model/userrole'),
		userprivilegeSchema = require('../../app/model/userprivilege'),
		usergroupSchema = require('../../app/model/usergroup'),
		settingSchema = require('../../app/model/setting'),
		logger = options.periodic.logger;

	/** set mongoose debug settings */
	if(options.debug){
		mongoose.set('debug', true);
	}
	mongoose.model('User',userSchema);
	mongoose.model('Item',itemSchema);
	mongoose.model('Collection',collectionSchema);
	mongoose.model('Compilation',compilationSchema);
	mongoose.model('Category',categorySchema);
	mongoose.model('Asset',assetSchema);
	mongoose.model('Contenttype',contenttypeSchema);
	mongoose.model('Tag',tagSchema);
	mongoose.model('Userrole',userroleSchema);
	mongoose.model('Userprivilege',userprivilegeSchema);
	mongoose.model('Usergroup',usergroupSchema);
	mongoose.model('Setting',settingSchema);


	mongoose.connection.on('error', function (err) {
		console.log('\u0007');
		logger.error('Cannot start application, Your MongoDB is not configured correctly, check db url connection string in your content/config/database.js file and that mongodb is running or you that you\'re using a valid connection string');
		logger.error(err.message);
	});
	if(options.periodic.app){
		options.periodic.app.all('*',function(req,res,next){
			if(mongoose.Connection.STATES.connected !== mongoose.connection.readyState){
				console.log('\u0007');
				next(new Error('mongodb is not connected, check db url connection string in your content/config/database.js file'));
			}
			else{
				next();
			}
		});
	}
};