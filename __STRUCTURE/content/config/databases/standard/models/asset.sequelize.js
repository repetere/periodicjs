'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
    defaultValue: 'VALID',
  },
  size: {
    type: Sequelize.INTEGER,
  },
  userid: {
    type: Sequelize.INTEGER,
  },
  username: {
    type: Sequelize.STRING,
  },
  assettype: {
    type: Sequelize.STRING,
  },
  fileurl: {
    type: Sequelize.STRING,
  },
  locationtype: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.TEXT,
  },
  content: {
    type: Sequelize.TEXT,
  },
  // filedata: {

  // },
  // attributes: {
    
  // },
  // versions: {
    
  // },
  random: {
    type: Sequelize.FLOAT,
  },
};

const options = {
  underscored: true,
  timestamps: true,
  indexes: [{
    fields: ['createdat'],
  }],
};

const associations = [
  {
    source: 'asset',
    association: 'hasOne',
    target: 'user',
    options: {
      as: 'author',
    }
  },
  {
    source: 'asset',
    association: 'hasMany',
    target: 'user',
    options: {
      as: 'authors',
    },
  },
  {
    source: 'asset',
    association: 'hasMany',
    target: 'tag',
    options: {
      as: 'tags',
    },
  },
  {
    source: 'asset',
    association: 'hasMany',
    target: 'category',
    options: {
      as: 'categories',
    },
  },
  // {
  //   source: 'asset',
  //   association: 'hasMany',
  //   target: 'asset',
  //   options: {
  //     as: 'related_assets',
  //   },
  // },
];

module.exports = {
  scheme,
  options,
  associations,
  coreDataOptions: {
    docid: ['_id', 'name'],
    sort: { createdat: -1, },
    search: ['title', 'name', ],
    population: 'author authors tags categories related_assets'
  },
};