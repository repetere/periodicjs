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
  // primaryauthor: {
  //   type: Sequelize.STRING,
  // },
  name: {
    type: Sequelize.STRING,
    unique: 'data_name',
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
  //   target: 'data',
  //   association: 'hasOne',
  //   source: 'user',
  //   options: {
  //     as: 'primaryauthor',
  //     // foreignKey: 'primaryauthor',
  //   },
  // },
  // {
  //   source: 'user',
  //   association: 'hasMany',
  //   target: 'data',
  //   options: {
  //     as: 'primaryauthor',
  //     foreignKey: 'primaryauthor',
  //   },
  // },
  {
    source: 'data',
    association: 'belongsToMany',
    target: 'asset',
    options: {
      as: 'assets',
      through: 'data_assets',
    },
  },
  {
    source: 'data',
    association: 'belongsToMany',
    target: 'tag',
    options: {
      as:'tags',
      through: 'data_tags',
    },
  },
  {
    source: 'data',
    association: 'belongsToMany',
    target: 'category',
    options: {
      as:'categories',
      through: 'data_categories',
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
    // population: 'tags categories primaryauthor',
  },
};