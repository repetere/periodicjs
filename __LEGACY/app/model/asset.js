'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const logger = console;
const PeriodicSchemaClass = require('./periodic_schema.class.js');
let schemaMethods = {};
let schemaStatics = {};
let schemaModelAttributes = {
	title: String,
	name: String,
	status: {
		type: String,
		'default': 'VALID'
	},
	size: Number,
	author: {
		type: ObjectId,
		ref: 'User'
	},
	userid: ObjectId,
	username: String,
	assettype: String,
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
	related_assets: [{
		type: ObjectId,
		ref: 'Asset'
	}],
	fileurl: String,
	locationtype: String,
	description: String,
	content: String,
	filedata: Schema.Types.Mixed,
	attributes: Schema.Types.Mixed,
	versions: Schema.Types.Mixed,
	random: Number
};

class PeriodicSchemaAttributes extends PeriodicSchemaClass.attributes{
	constructor() {
		super({
			entitytype: 'asset'
		});
	}
}
class assetModel extends PeriodicSchemaClass.model{
	constructor(resources) {
		resources = Object.assign({}, resources);
		resources.schemaStatics = schemaStatics;
		resources.schemaMethods = schemaMethods;
		resources.schemaModelAttributes = schemaModelAttributes;
		resources.periodicSchemaAttributes = new PeriodicSchemaAttributes();
		super(resources);
	}
}


module.exports = assetModel;
