'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.STRING,
  },
  firname: {
    type: Sequelize.STRING,
  },
  lastname: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  url: {
    type: Sequelize.STRING,
  },
  birthday: {
    type: Sequelize.DATE,
  },
  userid: {
    type: Sequelize.INTEGER,
  },
  accesstoken: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.TEXT,
  },
  activated: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  location: {
    type: Sequelize.STRING,
    // allowNull: false,
    get() {
      return JSON.parse(this.getDataValue('location'));
    },
    set(val) {
      this.setDataValue('location', JSON.stringify(val));
    },
  },
  accounttype: {
    type: Sequelize.STRING,
    default: 'basic',
  },
  gender: {
    type: Sequelize.STRING,
  },
  apikey: {
    type: Sequelize.STRING,
  },
  random: {
    type: Sequelize.FLOAT,
  }
};

const options = {
  underscored: true,
  timestamps: true,
  indexes: [{
    fields: ['createdat'],
  }],
};

const associations = [{
    source: 'account',
    association: 'hasMany',
    target: 'asset',
    options: {
      as: 'assets',
    }
  },
  {
    source: 'account',
    association: 'hasOne',
    target: 'asset',
    options: {
      as: 'primaryasset',
    },
  },
  {
    source: 'account',
    association: 'hasMany',
    target: 'asset',
    options: {
      as: 'coverimages',
    },
  },
  {
    source: 'account',
    association: 'hasOne',
    target: 'asset',
    options: {
      as: 'coverimage',
    },
  },
  {
    source: 'account',
    association: 'hasMany',
    target: 'userrole',
    options: {
      as: 'userroles',
    },
  },
  {
    source: 'account',
    association: 'hasMany',
    target: 'tag',
    options: {
      as: 'tags',
    },
  },
  {
    source: 'account',
    association: 'hasMany',
    target: 'category',
    options: {
      as: 'categories',
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
    search: ['email', 'firstname', 'lastname', 'name', ],
    population: 'assets primaryasset coverimages userroles tags categories',
  },
};