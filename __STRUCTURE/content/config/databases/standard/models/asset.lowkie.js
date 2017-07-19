'use strict';

const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
  id: ObjectId,
  title: String,
  name: String,
  status: {
    type: String,
    'default': 'VALID',
  },
  size: Number,
  author: {
    type: ObjectId,
    ref: 'User',
  },
  userid: ObjectId,
  username: String,
  assettype: String,
  authors: [{
    type: ObjectId,
    ref: 'User',
  }, ],
  tags: [{
    type: ObjectId,
    ref: 'Tag',
  }, ],
  categories: [{
    type: ObjectId,
    ref: 'Category',
  }, ],
  related_assets: [{
    type: ObjectId,
    ref: 'Asset',
  }, ],
  encrypted_client_side: String,
  fileurl: String,
  locationtype: String,
  description: String,
  content: String,
  filedata: Schema.Types.Mixed,
  attributes: Schema.Types.Mixed,
  versions: Schema.Types.Mixed,
  random: Number,
};

module.exports = {
  scheme,
  options: {},
  coreDataOptions: {
    docid: '_id',
    sort: { createdat: -1, },
    search: ['title', 'name', ],
    population: 'author authors tags categories related_assets',
  },
};