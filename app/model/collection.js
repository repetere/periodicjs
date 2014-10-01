'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var collectionSchema = new Schema({
	id: ObjectId,
	status: {
		type: String,
		'default': 'draft'
	},
	entitytype: {
		type: String,
		'default': 'collection'
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
	items: [{
		order: Number,
		additionalattributes: Schema.Types.Mixed,
		item: {
			type: ObjectId,
			ref: 'Item'
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
	attributes: Schema.Types.Mixed,
	contenttypeattributes: Schema.Types.Mixed,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});

collectionSchema.pre('save', function (next, done) {
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

// collectionSchema.post('init', function (doc) {
// 	console.log("model - collection.js - " + doc._id + ' has been initialized from the db');
// });
// collectionSchema.post('validate', function (doc) {
// 	console.log("model - collection.js - " + doc._id + ' has been validated (but not saved yet)');
// });
// collectionSchema.post('save', function (doc) {
// 	// this.db.models.Item.emit('created', this);
// 	console.log("model - collection.js - " + doc._id + ' has been saved');
// });
// collectionSchema.post('remove', function (doc) {
// 	console.log("model - collection.js - " + doc._id + ' has been removed');
// });

// collectionSchema.statics.getRandomWorkout = function (options, callback) {
// 	var self = this;
// 	// queryHelper.getRandomDocument({model:self},callback);
// };

module.exports = collectionSchema;
