'use strict';

const async = require('async');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const logger = console;
const PeriodicSchemaClass = require('./periodic_schema.class.js');
let schemaMethods = {};
let schemaStatics = {};
//http://cookbook.mongodb.org/patterns/date_range/
//http://cronchecker.net/check?utf8=%E2%9C%93&statement=1+*+*+*+*+*&button=
//http://crontab-generator.org/
let schemaModelAttributes = {
	status: {
		type: String,
		'default': 'draft'
	},
	publishat: {
		type: Date,
		'default': Date.now,
		index: true
	},
	title: String,
	name: {
		type: String,
		unique: true
	},
	dek: String,
	content: String,
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
	link: String,
	visibility: String,
	visibilitypassword: String,
	random: Number
};
let preSaveFunction = function (next, done) {
	this.random = Math.random();
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('title is too short'));
	}
	else {
		next();
	}
};

class PeriodicSchemaAttributes extends PeriodicSchemaClass.attributes{
	constructor() {
		super({
			entitytype: 'item'
		});
	}
}

class itemModel extends PeriodicSchemaClass.model{
	constructor(resources) {
		resources = Object.assign({}, resources);
		resources.schemaStatics = schemaStatics;
		resources.schemaMethods = schemaMethods;
		resources.schemaModelAttributes = schemaModelAttributes;
		resources.periodicSchemaAttributes = new PeriodicSchemaAttributes();
		super(resources);
		this.schema.pre('save', preSaveFunction);
	}
}

module.exports = itemModel;