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
    unique: 'account_name',
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
  },
  // primaryasset: {
  //   allowNull: true,
  //   type: Sequelize.INTEGER,
  //   references: {
  //     model: 'asset',
  //     key:'_id',
  //   },
  // },
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
  {
    target: 'asset',
    association: 'belongsTo',
    source: 'account',
    options: {
      as: 'primaryasset',
      foreignKey: 'primaryasset_afk',
    },
  },
  {
    target: 'asset',
    association: 'belongsTo',
    source: 'account',
    options: {
      as: 'coverimage',
      foreignKey: 'coverimage_afk',
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
    // population: 'assets primaryasset coverimages userroles tags categories',
    population: [
      {
        model: 'asset',
        as:'primaryasset',
      },
      {
        model: 'account_assets',
        // as:'assets',
      },
    ],
  },
};