'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usergroupid: {
    type: Sequelize.INTEGER,
    unique: 'usergroupid_idx',
  },
  title: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
    unique: 'usergroup_name',
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
  //   target: 'usergroup',
  //   options: {
  //     as: 'author',
  //     foreignKey: 'author',
  //   },
  // },
  // {
  //   source: 'account',
  //   association: 'hasMany',
  //   target: 'usergroup',
  //   options: {
  //     as: 'creator',
  //     foreignKey: 'creator',
  //   },
  // },
  {
    source: 'usergroup',
    association: 'belongsToMany',
    target: 'userrole',
    options: {
      as:'roles',
      through: 'usergroup_userroles',
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
    search: ['title', 'name', 'description'],
    population: 'roles author creator'
  },
};