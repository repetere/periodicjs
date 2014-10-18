'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var contenttypeSchema = new Schema({
	id: ObjectId,
	title: String,
	name: {
		type: String,
		unique: true
	},
	author: {
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
	attributes: [{
		title: String,
		name: String,
		datatype: String,
		defaultvalue: String
	}],
	extensionattributes: Schema.Types.Mixed
});

contenttypeSchema.pre('save', function (next, done) {
	// var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('Contenttype title is too short'));
	}
	// else if (this.name !== undefined && badname.test(this.name)) {
	// 	done(new Error('Contenttype title is invalid'));
	// }
	else {
		next();
	}
});

module.exports = contenttypeSchema;
