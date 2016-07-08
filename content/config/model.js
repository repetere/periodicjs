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
	const mongoose = options.mongoose;
	const periodic = options.periodic;
	const customSchema = options.periodic.custom_standard_models;
	const UserSchema = require('../../app/model/user.js');
	const ItemSchema = require('../../app/model/item.js');
	const DataSchema = require('../../app/model/data.js');
	const CollectionSchema = require('../../app/model/collection.js');
	const CompilationSchema = require('../../app/model/compilation.js');
	const CategorySchema = require('../../app/model/category.js');
	const AssetSchema = require('../../app/model/asset.js');
	const ContenttypeSchema = require('../../app/model/contenttype.js');
	const TagSchema = require('../../app/model/tag.js');
	const UserroleSchema = require('../../app/model/userrole');
	const UserprivilegeSchema = require('../../app/model/userprivilege');
	const UsergroupSchema = require('../../app/model/usergroup');
	const SettingSchema = require('../../app/model/setting');
	const	logger = options.periodic.logger;
	mongoose.connect(options.dburl, options.dboptions);

	/** set mongoose debug settings */
	if(options.debug){
		mongoose.set('debug', true);
	}
	mongoose.model('User',new UserSchema(customSchema.user).schema);
	mongoose.model('Item',new ItemSchema(customSchema.item).schema);
	mongoose.model('Data',new DataSchema(customSchema.data).schema);
	mongoose.model('Collection',new CollectionSchema(customSchema.collection).schema);
	mongoose.model('Compilation',new CompilationSchema(customSchema.compilation).schema);
	mongoose.model('Category',new CategorySchema(customSchema.category).schema);
	mongoose.model('Asset',new AssetSchema(customSchema.asset).schema);
	mongoose.model('Contenttype',new ContenttypeSchema(customSchema.contenttype).schema);
	mongoose.model('Tag',new TagSchema(customSchema.tag).schema);
	mongoose.model('Userrole',new UserroleSchema(customSchema.userrole).schema);
	mongoose.model('Userprivilege',new UserprivilegeSchema(customSchema.userprivilege).schema);
	mongoose.model('Usergroup',new UsergroupSchema(customSchema.usergroup).schema);
	mongoose.model('Setting',new SettingSchema(customSchema.setting).schema);


	mongoose.connection.on('error', function (err) {
		console.log('\u0007');
		logger.error('Cannot start application, Your MongoDB is not configured correctly, check db url connection string in your content/config/database.js file and that mongodb is running or you that you\'re using a valid connection string');
		logger.error(err.message);
	});
	if(periodic.app){
		periodic.app.all('*',function(req,res,next){
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