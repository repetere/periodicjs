'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userroleid: {
    type: Sequelize.INTEGER,
    unique: 'userroleid_idx',
  },
  title: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
    unique: 'userrole_name',
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
  //   target: 'userrole',
  //   options: {
  //     as: 'author',
  //     foreignKey: 'author',
  //   },
  // },
  // {
  //   source: 'account',
  //   association: 'hasMany',
  //   target: 'userrole',
  //   options: {
  //     as: 'creator',
  //     foreignKey: 'creator',
  //   },
  // },
  {
    source: 'userrole',
    association: 'belongsToMany',
    target: 'userprivilege',
    options: {
      as:'privileges',
      through: 'userrole_userprivileges',
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
    population: 'privileges author creator',
  },
};