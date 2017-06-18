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
    unique: true,
  },
  dek: {
    type: Sequelize.STRING,
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
    source: 'tag',
    association: 'hasOne',
    target: 'user',
    options: {
      as: 'author',
    }
  },
  {
    source: 'tag',
    association: 'belongsTo',
    target: 'asset',
    options: {
      as: 'primaryasset',
    },
  },
  // {
  //   source: 'tag',
  //   association: 'hasMany',
  //   target: 'tag',
  //   options: {
  //     as: 'parents',
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
    search: ['title', 'name', 'dek', 'content', ],
    population: 'author primaryasset parent'
  },
};