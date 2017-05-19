'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;

module.exports = (modelName) => {
  return {
    id: ObjectId,
    entitytype: {
      type: String,
      default: modelName,
    },
    attributes: Schema.Types.Mixed,
    contenttypeattributes: Schema.Types.Mixed,
    extensionattributes: Schema.Types.Mixed,
    random: Number,
    createdat: {
      type: Date,
      'default': Date.now,
    },
    updatedat: {
      type: Date,
      'default': Date.now
    },
  };
};