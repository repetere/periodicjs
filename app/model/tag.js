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
	dek: String,
	content: String,
	author: {
		type: ObjectId,
		ref: 'User'
	},
	primaryasset: {
		type: ObjectId,
		ref: 'Asset'
	},
	parent: [{
		type: ObjectId,
		ref: 'Tag'
	}], //http://docs.mongodb.org/manual/tutorial/model-tree-structures-with-child-references/
	random: Number
};
let preSaveFunction = function (next, done) {
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('Tag title is too short'));
	}
	else {
		next();
	}
};

class PeriodicSchemaAttributes extends PeriodicSchemaClass.attributes{
	constructor() {
		super({
			entitytype: 'tag'
		});
	}
}

schemaMethods.getChildren = function (getTagChildrenCallback) {
	var currentTag = {
			title: this.title,
			name: this.name,
			_id: this._id,
			childDocs: this.childDocs
		},
		Tag = mongoose.model('Tag');

	var getChildDocuments = function (documentobj, callbackGetChildDocuments) {
		console.log('check for children for: ', documentobj.name);
		var query = {
			parent: {
				$in: [documentobj._id]
			}
		};

		Tag.find(query).select('name title content').exec(function (err, children) {
			if (err) {
				callbackGetChildDocuments(err, null);
			}
			else {
				documentobj.childDocs = children;
				callbackGetChildDocuments(null, documentobj);
			}
		});
	};

	getChildDocuments(currentTag, function (err, updatedCurrentDoc) {
		currentTag = updatedCurrentDoc;
		if (currentTag.childDocs.length > 0) {
			async.each(
				currentTag.childDocs,
				function (child, asynccallback) {
					child.getChildren(function (err, updatedchild) {
						for (var x in currentTag.childDocs) {
							if (currentTag.childDocs[x].name === updatedchild.name) {
								currentTag.childDocs[x] = updatedchild;
							}
						}
						asynccallback(err);
					});
				},
				function (err) {
					if (err) {
						getTagChildrenCallback(err, null);
					}
					else {
						getTagChildrenCallback(null, currentTag);
					}
				});
		}
		else {
			getTagChildrenCallback(err, currentTag);
		}
	});
};

class tagModel extends PeriodicSchemaClass.model{
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

module.exports = tagModel;