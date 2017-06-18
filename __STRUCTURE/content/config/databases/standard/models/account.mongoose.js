'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
  id: ObjectId,
  email: {
    type: String,
    index: {
      unique: true,
      sparse: false
    }
  },
  firstname: String,
  lastname: String,
  name: {
    type: String,
    index: {
      unique: true,
      sparse: true
    }
  },
  password: String,
  url: String,
  birthday: Date,
  userid: {
    type: Number,
    index: {
      sparse: true
    }
  },
  accesstoken: String,
  description: {
    type: String,
    'default': 'No profile'
  },
  activated: {
    type: Boolean,
    'default': false
  },
  location: {
    city: String,
    country: String,
    state: String,
    zip: String,
    loc: {
      longitude: Number,
      latitude: Number
    }
  },
  accounttype: {
    type: String,
    'default': 'basic'
  },
  gender: {
    type: String
  },
  assets: [{
    type: ObjectId,
    ref: 'Asset'
  }],
  primaryasset: {
    type: ObjectId,
    ref: 'Asset'
  },
  coverimages: [{
    type: ObjectId,
    ref: 'Asset'
  }],
  coverimage: {
    type: ObjectId,
    ref: 'Asset'
  },
  userroles: [{
    type: ObjectId,
    ref: 'Userrole'
  }],
  tags: [{
    type: ObjectId,
    ref: 'Tag'
  }],
  categories: [{
    type: ObjectId,
    ref: 'Category'
  }],
  apikey: String,
  random: Number
};

module.exports = {
  scheme,
  options: {},
  coreDataOptions: {
    docid: '_id',
    sort: { createdat: -1, },
    search: ['email', 'firstname', 'lastname', 'name', ],
    population: 'assets primaryasset coverimages userroles tags categories'
  }
};