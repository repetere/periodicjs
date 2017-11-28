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
  firstname: {
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
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('location') ? JSON.parse(this.getDataValue('location')) : {};
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
  //   target: 'account',
  //   association: 'hasOne',
  //   source: 'asset',
  //   options: {
  //     as: 'primaryasset',
  //     foreignKey: 'primaryasset',
  //   },
  // },
  // {
  //   target: 'account',
  //   association: 'hasOne',
  //   source: 'asset',
  //   options: {
  //     as: 'coverimage',
  //     foreignKey: 'coverimage',
  //   },
  // },
  {
    source: 'asset',
    association: 'hasMany',
    target: 'account',
    options: {
      as: 'primaryasset',
      foreignKey: 'primaryasset',
    },
  },
  {
    source: 'asset',
    association: 'hasMany',
    target: 'account',
    options: {
      as: 'coverimage',
      foreignKey: 'coverimage',
    },
  },
  {
    source: 'account',
    association: 'belongsToMany',
    target: 'asset',
    options: {
      as: 'assets',
      through: 'account_assets',
    },
  },
  {
    source: 'account',
    association: 'belongsToMany',
    target: 'asset',
    options: {
      as:'coverimages',
      through: 'account_coverimages',
    },
  },
  {
    source: 'account',
    association: 'belongsToMany',
    target: 'userrole',
    options: {
      as:'userroles',
      through: 'account_userroles',
    },
  },
  {
    source: 'account',
    association: 'belongsToMany',
    target: 'tag',
    options: {
      as:'tags',
      through: 'account_tags',
    },
  },
  {
    source: 'account',
    association: 'belongsToMany',
    target: 'category',
    options: {
      as:'categories',
      through: 'account_categories',
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