'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
  id: ObjectId,
  status: {
    type: String,
    default: 'draft',
  },
  publishat: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    unique: true
  },
  title: String,
  dek: String,
  content: String,
  link: String,
  visibility: String,
  visibilitypassword: Date,
  random: Number,
  primaryasset: {
    type: ObjectId,
    ref: 'Asset'
  },
  primaryauthor: {
    type: ObjectId,
    ref: 'User'
  },
  source: {
    type: ObjectId,
    ref: 'Source'
  },

  assets: [{
    type: ObjectId,
    ref: 'Asset'
  }],
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
  contenttypes: [{
    type: ObjectId,
    ref: 'Contenttype'
  }],
};

module.exports = {
  scheme,
  options: {},
};