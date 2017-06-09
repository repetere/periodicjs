'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: Sequelize.STRING,
    default: 'active',
  },
  publishat: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  title: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
    unique: true,
  },
  content: {
    type: Sequelize.TEXT,
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
};

const associations = [
  {
    source: 'data',
    association: 'hasMany',
    target: 'tag',
    options: {
      as: 'tags',
    }
  },
  {
    source: 'data',
    association: 'hasMany',
    target: 'category',
    options: {
      as: 'categories',
    },
  },
  {
    source: 'data',
    association: 'hasOne',
    target: 'user',
    options: {
      as: 'primaryauthor',
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
    search: ['title', 'name', 'content'],
    population: 'tags categories primaryauthor',
  },
};