'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
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
    default: 'No Profile',
  },
  accounttype: {
    type: String,
    default: 'basic',
  },
  location: {
    city: String,
    country: String,
    state: String,
    zip: String,
    longitude: Number,
    latitude: Number,
  },
  primaryasset: {
    type: ObjectId,
    ref: 'Asset',
  },
  coverimage: {
    type: ObjectId,
    ref: 'Asset',
  },
  coverimages: [{
    type: ObjectId,
    ref: 'Asset',
  }, ],
  assets: [{
    type: ObjectId,
    ref: 'Asset',
  }, ],
  userroles: [{
    type: ObjectId,
    ref: 'Userrole',
  }, ],
  tags: [{
    type: ObjectId,
    ref: 'Tag',
  }, ],
  categories: [{
    type: ObjectId,
    ref: 'Contenttype',
  }, ],
  contenttypes: [{
    type: ObjectId,
    ref: 'Contenttype',
  }, ],
};

module.exports = {
  scheme,
  options: {},
  coreDataOptions: {
    docid: ['_id', 'name', ],
    sort: { createdat: -1, },
    search: ['name', 'email', 'firstname', 'lastname', 'description'],
    // limit: 500,
    // skip: 0,
    population: 'coverimage coverimages primaryasset assets userroles tags categories contenttypes',
    // fields: {},
    // pagelength:15,
    // tract_changes:true,
    // xss_whitelist:['p','b'],
  },
};