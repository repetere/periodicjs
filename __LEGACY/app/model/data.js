'use strict';

const async = require('async');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const logger = console;
const PeriodicSchemaClass = require('./periodic_schema.class.js');
let schemaMethods = {};
let schemaStatics = {};
let schemaModelAttributes = {
	status: {
		type: String,
		'default': 'active'
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
	content: String,
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
	random: Number
};
let preSaveFunction = function (next, done) {
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('Data name is too short'));
	}
	else {
		next();
	}
};

class PeriodicSchemaAttributes extends PeriodicSchemaClass.attributes{
	constructor() {
		super({
			entitytype: 'data'
		});
	}
}

class dataModel extends PeriodicSchemaClass.model{
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

module.exports = dataModel;