'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
exports.attributes = class ModelAttributes { 
  constructor(options) {
    if (!options.entitytype) {
      throw new Error('All periodic models are required to have an "entitytype"');
    }
    this.id = ObjectId;
    this.createdat = {
      type: Date,
      'default': Date.now
    };
    this.updatedat = {
      type: Date,
      'default': Date.now
    };
    this.contenttypes = [{
      type: ObjectId,
      ref: 'Contenttype'
    }];
    this.entitytype= {
      type: String,
      'default': options.entitytype
    };
    this.changes= [{
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
    }];
    this.attributes = Schema.Types.Mixed;
    this.contenttypeattributes= Schema.Types.Mixed;
    this.extensionattributes= Schema.Types.Mixed;
  }
};
exports.model = class ModelSchema {
  constructor(resources) {
    let customSchemaData = Object.assign({}, resources.customSchemaData);
		let schemaAttributes = Object.assign({},resources.periodicSchemaAttributes, resources.schemaModelAttributes, customSchemaData);
		let mongooseSchema = new Schema(schemaAttributes);
		mongooseSchema.statics = resources.schemaStatics;
		mongooseSchema.methods = resources.schemaMethods;
		this.schema = mongooseSchema;
		this.attributes = schemaAttributes;
  }
};
