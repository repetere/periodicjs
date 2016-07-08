'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const logger = console;
const PeriodicSchemaClass = require('./periodic_schema.class.js');
let schemaMethods = {};
let schemaStatics = {};
let schemaModelAttributes = {
	userroleid: {
		type: Number,
		unique: true
	},
	title: String,
	name: {
		type: String,
		unique: true
	},
	privileges: [{
		type: ObjectId,
		ref: 'Userprivilege'
	}],
	author: {
		type: ObjectId,
		ref: 'User'
	},
	description: String,
	random: Number
};

let preSaveFunction = function (next, done) {
	if (this.name !== undefined && this.name.length < 4) {
		done(new Error('User role title is too short'));
	}
	else {
		next();
	}
};

class PeriodicSchemaAttributes extends PeriodicSchemaClass.attributes{
	constructor() {
		super({
			entitytype: 'userrole'
		});
	}
}

class userprivilegeModel extends PeriodicSchemaClass.model{
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

module.exports = userprivilegeModel;