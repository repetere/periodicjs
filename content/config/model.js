'use strict';

const capitalize = require('capitalize');
const path = require('path');
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
	const customSchema = options.periodic.custom_standard_models || require(path.join(__dirname, './model/standard_models.js'));
	const logger = options.periodic.logger;
	const standard_periodic_models = [
		'user',
		'item',
		'data',
		'collection',
		'compilation',
		'category',
		'asset',
		'contenttype',
		'tag',
		'userrole',
		'userprivilege',
		'usergroup',
		'setting'
	];
	let SchemaObjects = {};
	mongoose.connect(options.dburl, options.dboptions);

	standard_periodic_models.forEach(modelname => {
		let capitalizedModelname = capitalize(modelname);
		SchemaObjects[`${capitalizedModelname}Schema`] = require(`../../app/model/${modelname}.js`);
	});
	
	/** set mongoose debug settings */
	if(options.debug){
		mongoose.set('debug', true);
	}
	/**
	 * Test to make sure models are not defined before definition
	 */
	standard_periodic_models.forEach(modelname => {
		let capitalizedModelname = capitalize(modelname);
		let schemaName = `${capitalizedModelname}Schema`;
		if (Object.keys(mongoose.models).indexOf(capitalizedModelname)===-1) {
				mongoose.model(capitalizedModelname,new SchemaObjects[schemaName](customSchema[modelname]).schema);
		}
	});
	// mongoose.model('User',new UserSchema(customSchema.user).schema);
	// mongoose.model('User',new SchemaObjects['UserSchema'](customSchema.user).schema);

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