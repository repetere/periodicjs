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
  author: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
    unique: 'category_name',
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
  indexes: [
    {
      fields: [
        'createdat',
      ],
    },
  ],
  createdAt: 'createdat',
  updatedAt: 'updatedat',
};

const associations = [
  // {
  //   source: 'user',
  //   association: 'hasMany',
  //   target: 'category',
  //   options: {
  //     as: 'author',
  //     foreignKey: 'author',
  //   },
  // },
  // {
  //   source: 'asset',
  //   association: 'hasMany',
  //   target: 'category',
  //   options: {
  //     as: 'primaryasset',
  //     foreignKey: 'primaryasset',
  //   },
  // },
  {
    source: 'category',
    association: 'belongsToMany',
    target: 'category',
    options: {
      as: 'parent',
      through: 'category_parent',
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