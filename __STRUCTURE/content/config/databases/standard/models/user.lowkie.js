'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const extensionSchema = Schema({
  name: String,
  email: String,
  firstname: String,
  lastname: String,
  password: String,
  url: String,
  birthday: Date,
  userid: Number,
  accesstoken: String,
  gender: String,
  activated: Boolean,
  description: {
    type: String,
    default:'No Profile',
  },
  accounttype: {
    type: String,
    default:'basic',
  },
  location: {
    city: String,
    country: String,
    state: String,
    zip: String,
    longitude:Number,
    latitude:Number,
  },
  primaryasset: {
    type: ObjectId,
    ref:'Asset'
  },
  coverimage: {
    type: ObjectId,
    ref:'Asset'
  },
  coverimages: [
    {
      type: ObjectId,
      ref:'Asset'
    }
  ],
  assets: [
    {
      type: ObjectId,
      ref:'Asset'
    }
  ],
  userroles: [
    {
      type: ObjectId,
      ref:'Userrole'
    }
  ],
  tags: [
    {
      type: ObjectId,
      ref:'Tag'
    }
  ],
  categories: [
    {
      type: ObjectId,
      ref:'Contenttype'
    }
  ],
  contenttypes: [
    {
      type: ObjectId,
      ref:'Contenttype'
    }
  ],
  entitytype: String,
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
});

module.exports = {
  schema: extensionSchema,
  modelOptions: {},
};