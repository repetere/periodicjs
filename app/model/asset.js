'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var assetSchema = new Schema({
	id: ObjectId,
	title: String,
	name: String,
	status: {
		type: String,
		'default': 'VALID'
	},
	createdat: {
		type: Date,
		'default': Date.now
	},
	updated: {
		type: Date,
		'default': Date.now
	},
	// size: Number,
	author: {
		type: ObjectId,
		ref: 'User'
	},
	entitytype: {
		type: String,
		'default': 'asset'
	},
	userid: ObjectId,
	username: String,
	assettype: {
		type: String,
		'default': 'image'
	},
	contenttypes: [{
		type: ObjectId,
		ref: 'Contenttype'
	}],
	authors: [{
		type: ObjectId,
		ref: 'User'
	}],
	tags: [{
		type: ObjectId,
		ref: 'Tag'
	}],
	categories: [{
		type: ObjectId,
		ref: 'Category'
	}],
	changes: [{
		createdat: {
			type: Date,
			'default': Date.now
		},
		editor: {
			type: ObjectId,
			ref: 'User'
		},
		editor_username: String,
		changeset: Schema.Types.Mixed
	}],
	fileurl: String,
	locationtype: String,
	description: String,
	content: String,
	filedata: Schema.Types.Mixed,
	attributes: Schema.Types.Mixed,
	versions: Schema.Types.Mixed,
	contenttypeattributes: Schema.Types.Mixed,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});

/*
assetSchema.post('init', function (doc) {
	logger.info('model - asset.js - ' + doc._id + ' has been initialized from the db');
});
assetSchema.post('validate', function (doc) {
	logger.info('model - asset.js - ' + doc._id + ' has been validated (but not saved yet)');
});
assetSchema.post('save', function (doc) {
	logger.info('model - asset.js - ' + doc._id + ' has been saved');
});
assetSchema.post('remove', function (doc) {
	logger.info('model - asset.js - ' + doc._id + ' has been removed');
});
*/

module.exports = assetSchema;
