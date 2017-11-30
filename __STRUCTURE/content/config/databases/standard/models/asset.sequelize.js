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
    unique: 'asset_name',
  },
  status: {
    type: Sequelize.STRING,
    defaultValue: 'VALID',
  },
  size: {
    type: Sequelize.INTEGER,
  },
  userid: {
    type: Sequelize.INTEGER,
  },
  username: {
    type: Sequelize.STRING,
  },
  assettype: {
    type: Sequelize.STRING,
  },
  fileurl: {
    type: Sequelize.STRING,
  },
  locationtype: {
    type: Sequelize.STRING,
  },
  encrypted_client_side: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.TEXT,
  },
  content: {
    type: Sequelize.TEXT,
  },
  filedata: {
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('filedata') ? JSON.parse(this.getDataValue('filedata')) : {};
    },
    set(val) {
      this.setDataValue('filedata', JSON.stringify(val));
    },
  },
  versions: {
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('versions') ? JSON.parse(this.getDataValue('versions')) : {};
    },
    set(val) {
      this.setDataValue('versions', JSON.stringify(val));
    },
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
  // hooks: {
  //   beforeCreate: (asset, options) => {
  //     asset.attributes = asset._attributes;
  //   },
  //   beforeUpdate: (asset, options) => {
  //     asset.attributes = asset._attributes;
  //   },
  // },
  // getterMethods: {
  //   attributes() {
  //     return this.getDataValue('attributes') ? JSON.parse(this.getDataValue('attributes')) : {};
  //   },
  // },
  // setterMethods: {
  //   attributes(val) {
  //     this.setDataValue('attributes', JSON.stringify(val));
  //   },
  // },
};

const associations = [
  // {
  //   source: 'asset',
  //   association: 'hasMany',
  //   target: 'user',
  //   options: {
  //     as: 'primaryasset',
  //     foreignKey: 'primaryasset',
  //   },
  // },
  // {
  //   target: 'asset',
  //   association: 'hasOne',
  //   source: 'user',
  //   options: {
  //     as: 'author',
  //     foreignKey: 'author',
  //   },
  // },
  // {
  //   target: 'user',
  //   association: 'belongsTo',
  //   source: 'asset',
  //   options: {
  //     as: 'author',
  //     foreignKey: 'author_asfk',
  //   },
  // },
  {
    source: 'asset',
    association: 'belongsToMany',
    target: 'user',
    options: {
      as: 'authors',
      through: 'asset_authors',
    },
  },
  {
    source: 'asset',
    association: 'belongsToMany',
    target: 'tag',
    options: {
      as: 'tags',
      through: 'asset_tags',
    },
  },
  {
    source: 'asset',
    association: 'belongsToMany',
    target: 'category',
    options: {
      as: 'categories',
      through: 'asset_categories',
    },
  },
  {
    source: 'asset',
    association: 'belongsToMany',
    target: 'asset',
    options: {
      as: 'related_assets',
      through: 'asset_related_assets',
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
    population: 'author authors tags categories related_assets'
  },
};