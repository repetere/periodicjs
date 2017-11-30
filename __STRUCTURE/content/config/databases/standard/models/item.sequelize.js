'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    // type: Sequelize.UUID,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: Sequelize.STRING,
    default: 'draft',
  },
  publishat: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  name: {
    type: Sequelize.STRING,
    unique: 'item_name',
  },
  title: {
    type: Sequelize.STRING,
  },
  dek: {
    type: Sequelize.TEXT,
  },
  content: {
    type: Sequelize.TEXT,
  },
  link: {
    type: Sequelize.STRING,
  },
  visibility: {
    type: Sequelize.STRING,
  },
  visibilitypassword: {
    type: Sequelize.STRING,
  },
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
  createdAt: 'createdat',
  updatedAt: 'updatedat',
};

const associations = [
  // {
  //   source: 'user',
  //   association: 'hasMany',
  //   target: 'item',
  //   options: {
  //     as: 'primaryauthor',
  //     foreignKey: 'primaryauthor',
  //   },
  // },
  // {
  //   target: 'item',
  //   association: 'hasMany',
  //   source: 'asset',
  //   options: {
  //     as: 'primaryasset',
  //     foreignKey: 'primaryasset',
  //   },
  // },
  {
    source: 'item',
    association: 'belongsToMany',
    target: 'user',
    options: {
      as: 'authors',
      through: 'item_authors',
    },
  },
  {
    source: 'item',
    association: 'belongsToMany',
    target: 'asset',
    options: {
      as: 'assets',
      through: 'item_assets',
    },
  },
  {
    source: 'item',
    association: 'belongsToMany',
    target: 'tag',
    options: {
      as:'tags',
      through: 'item_tags',
    },
  },
  {
    source: 'item',
    association: 'belongsToMany',
    target: 'category',
    options: {
      as:'categories',
      through: 'item_categories',
    },
  },
  {
    source: 'item',
    association: 'belongsToMany',
    target: 'contenttype',
    options: {
      as:'contenttypes',
      through: 'item_contenttypes',
    },
  },
];

module.exports = {
  scheme,
  options,
  associations,
  coreDataOptions: {
    docid: ['_id', 'name'],
    sort: { createdat: -1, },
    search: ['name', 'title', 'dek', 'content', 'link', ],
    // limit: 500,
    // skip: 0,
    population: 'primaryauthor primaryasset asset assets authors tags categories contenttypes',
    // fields: {},
    // pagelength:15,
    // tract_changes:true,
    // xss_whitelist:['p','b'],
  },
};