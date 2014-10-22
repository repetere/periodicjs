'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

//http://cookbook.mongodb.org/patterns/date_range/
//http://cronchecker.net/check?utf8=%E2%9C%93&statement=1+*+*+*+*+*&button=
//http://crontab-generator.org/
var itemSchema = new Schema({
	id: ObjectId,
	status: {
		type: String,
		'default': 'draft'
	},
	entitytype: {
		type: String,
		'default': 'item'
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
	dek: String,
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
	assets: [{
		type: ObjectId,
		ref: 'Asset'
	}],
	primaryasset: {
		type: ObjectId,
		ref: 'Asset'
	},
	authors: [{
		type: ObjectId,
		ref: 'User'
	}],
	primaryauthor: {
		type: ObjectId,
		ref: 'User'
	},
	source: {
		type: ObjectId,
		ref: 'Source'
	},
	collectionitemonly: {
		type: Boolean,
		'default': false
	},
	itemauthorname: String,
	originalitem: {
		originalid: String,
		originaldate: Date,
		originaldata: Schema.Types.Mixed
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
	link: String,
	visibility: String,
	visibilitypassword: String,
	contenttypeattributes: Schema.Types.Mixed,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});


itemSchema.pre('save', function (next, done) {
	this.random = Math.random();
	// var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('title is too short'));
	}
	// else if (this.name !== undefined && badname.test(this.name)) {
	// 	done(new Error('Invalid title'));
	// }
	else {
		next();
	}
});

module.exports = itemSchema;
