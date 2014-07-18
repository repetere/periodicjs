'use strict';

module.exports = function(options){
	var mongoose = options.mongoose,
		db = mongoose.connect(options.dburl),
		userSchema = require('../../app/model/user.js'),
		itemSchema = require('../../app/model/item.js'),
		collectionSchema = require('../../app/model/collection.js'),
		categorySchema = require('../../app/model/category.js'),
		assetSchema = require('../../app/model/asset.js'),
		contenttypeSchema = require('../../app/model/contenttype.js'),
		tagSchema = require('../../app/model/tag.js'),
		userroleSchema = require('../../app/model/userrole'),
		userprivilegeSchema = require('../../app/model/userprivilege'),
		usergroupSchema = require('../../app/model/usergroup'),
		logger = options.periodic.logger;

	if(options.debug){
		mongoose.set('debug', true);
	}
	mongoose.model('User',userSchema);
	mongoose.model('Item',itemSchema);
	mongoose.model('Collection',collectionSchema);
	mongoose.model('Category',categorySchema);
	mongoose.model('Asset',assetSchema);
	mongoose.model('Contenttype',contenttypeSchema);
	mongoose.model('Tag',tagSchema);
	mongoose.model('Userrole',userroleSchema);
	mongoose.model('Userprivilege',userprivilegeSchema);
	mongoose.model('Usergroup',usergroupSchema);


	mongoose.connection.on('error', function (err) {
		logger.error("Cannot start application, Your MongoDB is not configured correctly, check db url connection string in your content/config/database.js file and that mongodb is running or you that you're using a valid connection string");
		logger.error(err.message);
	});
	if(options.periodic.app){
		options.periodic.app.all('*',function(req,res,next){
			if(mongoose.Connection.STATES.connected !== mongoose.connection.readyState){
				next(new Error("mongodb is not connected, check db url connection string in your content/config/database.js file"));
			}
			else{
				next();
			}
		});
	}
};