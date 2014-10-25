'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var compilationSchema = new Schema({
	id: ObjectId,
	status: {
		type: String,
		'default': 'draft'
	},
	entitytype: {
		type: String,
		'default': 'compilation'
	},
	title: String,
	name: {
		type: String,
		unique: true
	},
	dek: String,
	content: String,
	authors: [{
		type: ObjectId,
		ref: 'User'
	}],
	primaryasset: {
		type: ObjectId,
		ref: 'Asset'
	},
	assets: [{
		type: ObjectId,
		ref: 'Asset'
	}],
	primaryauthor: {
		type: ObjectId,
		ref: 'User'
	},
	createdat: {
		type: Date,
		'default': Date.now
	},
	updatedat: {
		type: Date,
		'default': Date.now
	},
	publishat: {
		type: Date,
		'default': Date.now,
		index: true
	},
	content_entities: [{
		entitytype: String,
		order: {
			type: Number,
			'default': 1
		},
		additionalattributes: Schema.Types.Mixed,
		entity_item: {
			type: ObjectId,
			ref: 'Item'
		},
		entity_collection: {
			type: ObjectId,
			ref: 'Collection'
		}
	}],
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
	extensionattributes: Schema.Types.Mixed,
	contenttypeattributes: Schema.Types.Mixed,
	random: Number
});

compilationSchema.pre('save', function (next, done) {
	// var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('title is too short'));
	}
	// else if(this.name !== undefined && badname.test(this.name) ){
	//     done(new Error('Invalid title'));
	// }
	else {
		next();
	}
});

module.exports = compilationSchema;
