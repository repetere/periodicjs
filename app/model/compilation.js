'use strict';

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
		'default': 'draft'
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
	tags: [{
		type: ObjectId,
		ref: 'Tag'
	}],
	categories: [{
		type: ObjectId,
		ref: 'Category'
	}],
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
			entitytype: 'compilation'
		});
	}
}

class compilationModel extends PeriodicSchemaClass.model{
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

module.exports = compilationModel;
