'use strict';
const lowkie = require('./lowkie.schema.js');
const mongoose = require('./mongoose.schema.js');
const sequelize = require('./sequelize.schema.js');


module.exports = {
  lowkie,
  mongoose,
  sequelize,
  coreDataOptions: {
    configuration: {
      docid: ['_id','filepath',],
      sort: { filepath: -1, createdat: -1, },
      search: ['filepath', ],
      // population: 'assets primaryasset coverimages coverimage userroles tags categories'
    },
    extension: {
      docid: ['_id','name',],
      sort: { periodic_type: 1, periodic_priority: 1, createdat: -1, },
      search: [ 'name', ],
      // population: 'assets primaryasset coverimages coverimage userroles tags categories'
    },
  },
};