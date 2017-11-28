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
  hooks: {
    beforeCreate: (asset, options) => {
      asset.attributes = asset._attributes;
    },
    beforeUpdate: (asset, options) => {
      asset.attributes = asset._attributes;
    },
  },
};

const associations = [
  {
    target: 'contenttype',
    association: 'hasOne',
    source: 'user',
    options: {
      as: 'author',
      foreignKey: 'author',
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
    search: ['title', 'name', ],
    population: 'author attributes',
  },
};