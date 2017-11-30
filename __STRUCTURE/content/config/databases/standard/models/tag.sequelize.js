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
    unique: 'tag_name',
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
  // {
  //   source: 'user',
  //   association: 'hasMany',
  //   target: 'tag',
  //   options: {
  //     as: 'author',
  //     foreignKey: 'author',
  //   },
  // },
  // {
  //   source: 'asset',
  //   association: 'hasMany',
  //   target: 'tag',
  //   options: {
  //     as: 'primaryasset',
  //     foreignKey: 'primaryasset',
  //   },
  // },
  {
    source: 'tag',
    association: 'belongsToMany',
    target: 'tag',
    options: {
      as: 'parent',
      through: 'tag_parent',
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
    search: ['title', 'name', 'dek', 'content', ],
    population: 'author primaryasset parent'
  },
};