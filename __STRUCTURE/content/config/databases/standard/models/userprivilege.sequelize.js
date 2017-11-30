'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userprivilegeid: {
    type: Sequelize.INTEGER,
    unique: 'userprivilegeid_idx',
  },
  title: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
    unique: 'userprivilege_name',
  },
  description: {
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
  createdAt: 'createdat',
  updatedAt: 'updatedat',
};

const associations = [
  // {
  //   source: 'user',
  //   association: 'hasMany',
  //   target: 'userprivilege',
  //   options: {
  //     as: 'author',
  //     foreignKey: 'author',
  //   },
  // },
  // {
  //   source: 'account',
  //   association: 'hasMany',
  //   target: 'userprivilege',
  //   options: {
  //     as: 'creator',
  //     foreignKey: 'creator',
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
    search: ['title', 'name', 'description'],
    // population: 'author creator',
  },
};