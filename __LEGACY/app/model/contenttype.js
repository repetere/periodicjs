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
	title: String,
	name: {
		type: String,
		unique: true
	},
	author: {
		type: ObjectId,
		ref: 'User'
	},
	attributes: [{
		title: String,
		name: String,
		description: String,
		datatype: String,
		data: Schema.Types.Mixed,
		defaultvalue: String
	}]
};
let preSaveFunction = function (next, done) {
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('Contenttype title is too short'));
	}
	else {
		next();
	}
};

class PeriodicSchemaAttributes extends PeriodicSchemaClass.attributes{
	constructor() {
		super({
			entitytype: 'contenttype'
		});
	}
}

class contenttypeModel extends PeriodicSchemaClass.model{
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

module.exports = contenttypeModel;