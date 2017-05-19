'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    // type: Sequelize.INTEGER,
    type: Sequelize.UUID,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
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
  gender: {
    type: Sequelize.STRING,
  },
  activated: {
    type: Sequelize.BOOLEAN,
  },
  description: {
    type: Sequelize.STRING,
    default: 'No Profile',
  },
  accounttype: {
    type: Sequelize.STRING,
    default: 'basic',
  },
  location_city: {
    type: Sequelize.BOOLEAN,
  },
  location_country: {
    type: Sequelize.BOOLEAN,
  },
  location_state: {
    type: Sequelize.BOOLEAN,
  },
  location_zip: {
    type: Sequelize.BOOLEAN,
  },
  location_longitude: {
    type: Sequelize.INTEGER,
  },
  location_latitude: {
    type: Sequelize.INTEGER,
  },
  primaryasset: {
    type: ObjectId,
    ref: 'Asset'
  },
  coverimage: {
    type: ObjectId,
    ref: 'Asset'
  },
  coverimages: [{
    type: ObjectId,
    ref: 'Asset'
  }],
  assets: [{
    type: ObjectId,
    ref: 'Asset'
  }],
  userroles: [{
    type: ObjectId,
    ref: 'Userrole'
  }],
  tags: [{
    type: ObjectId,
    ref: 'Tag'
  }],
  categories: [{
    type: ObjectId,
    ref: 'Contenttype'
  }],
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
    target: 'user',
    options: {
      as: 'primaryasset',
    }
  },
  {
    source: 'asset',
    association: 'hasOne',
    target: 'user',
    options: {
      as: 'coverimage',
    }
  },
  {
    source: 'user',
    association: 'hasMany',
    target: 'asset',
    options: {
      as: 'assets',
    },
  },
  {
    source: 'user',
    association: 'hasMany',
    target: 'asset',
    options: {
      as: 'coverimages',
    },
  },
  {
    source: 'userrole',
    association: 'hasMany',
    target: 'user',
    options: {
      as: 'userroles',
    },
  },
  {
    source: 'user',
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