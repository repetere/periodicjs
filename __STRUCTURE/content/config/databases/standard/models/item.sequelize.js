'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    // type: Sequelize.INTEGER,
    type: Sequelize.UUID,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: String,
    default: 'draft',
  },
  publishat: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  name: {
    type: String,
    unique: true
  },
  title: {
    type: Sequelize.STRING,
  },
  dek: {
    type: Sequelize.STRING,
  },
  content: {
    type: Sequelize.STRING,
  },
  link: {
    type: Sequelize.STRING,
  },
  visibility: {
    type: Sequelize.STRING,
  },
  visibilitypassword: {
    type: Sequelize.STRING,
  },
  random: {
    type: Sequelize.FLOAT,
  },
  contenttypes: [{
    type: ObjectId,
    ref: 'Contenttype'
  }],
};

const options = {
  underscored: true,
  timestamps: true,
  indexes: [{
    fields: ['createdat'],
  }],
  // getterMethods:{
  //   config: function () {
  //     // // console.log('getterTHIS', this);
  //     // console.log('this.dataValues.config', this.dataValues.config);
  //     // // console.log('this.config', this.config);
  //     // // console.log('this.config.toString()', this.config.toString());
  //     // console.log('this.filepath', this.filepath);
  //     return JSON.parse(this.dataValues.config);
  //   },
  // },
  // setterMethods: {
  //   config: function(value) {
  //     this.setDataValue('config', JSON.stringify(value));
  //   },
  // },
};

const associations = [{
    source: 'asset',
    association: 'hasOne',
    target: 'item',
    options: {
      as: 'primaryasset',
    }
  },
  {
    source: 'user',
    association: 'hasOne',
    target: 'item',
    options: {
      as: 'primaryauthor',
    }
  },
  {
    source: 'item',
    association: 'hasMany',
    target: 'asset',
    options: {
      as: 'assets',
    },
  },
  {
    source: 'item',
    association: 'hasMany',
    target: 'user',
    options: {
      as: 'authors',
    },
  },
  {
    source: 'item',
    association: 'hasMany',
    target: 'tag',
    options: {
      as: 'tags',
    },
  },
  {
    source: 'item',
    association: 'hasMany',
    target: 'category',
    options: {
      as: 'categories',
    },
  },
  {
    source: 'item',
    association: 'hasMany',
    target: 'contenttype',
    options: {
      as: 'contenttypes',
    },
  },
];

module.exports = {
  scheme,
  options,
  associations,
};