'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;

module.exports = (modelName) => {
  return {
    entitytype: {
      type: String,
      default: modelName,
    },
    _attributes: Schema.Types.Mixed,
    contenttypeattributes: Schema.Types.Mixed,
    extensionattributes: Schema.Types.Mixed,
    random: Number,
    createdat: {
      type: Date,
      'default': Date.now,
    },
    updatedat: {
      type: Date,
      'default': Date.now,
    },
  };
};