'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var dataSchema = new Schema({
	id: ObjectId,
	status: {
		type: String,
		'default': 'active'
	},
	entitytype: {
		type: String,
		'default': 'data'
	},
	publishat: {
		type: Date,
		'default': Date.now,
		index: true
	},
	createdat: {
		type: Date,
		'default': Date.now
	},
	updatedat: {
		type: Date,
		'default': Date.now
	},
	title: String,
	name: {
		type: String,
		unique: true
	},
	content: String,
	contenttypes: [{
		type: ObjectId,
		ref: 'Contenttype'
	}],
	tags: [{
		type: ObjectId,
		ref: 'Tag'
	}],
	categories: [{
		type: ObjectId,
		ref: 'Category'
	}],
	primaryauthor: {
		type: ObjectId,
		ref: 'User'
	},
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
	attributes: Schema.Types.Mixed,
	contenttypeattributes: Schema.Types.Mixed,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});

module.exports = dataSchema;
