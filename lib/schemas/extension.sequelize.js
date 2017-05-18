'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  require: {
    type: Sequelize.STRING,
  },
  source: {
    type: Sequelize.STRING,
  },
  version: {
    type: Sequelize.STRING,
  },
  enabled: {
    type: Sequelize.BOOLEAN,
  },
  type: {
    type: Sequelize.INTEGER,
  },
  priority: {
    type: Sequelize.INTEGER,
  },
  periodic_compatibility: {
    type: Sequelize.STRING,
    defaultValue: 'periodicjs.container.default',
  },
  periodic_config: Sequelize.STRING,
  createdat: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedat: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
};
const options = {
  underscored: true,
  timestamps: true,
  indexes: [{
    fields: ['createdat'],
  }],
  getterMethods: {
    periodic_config: function() {
      // // console.log('getterTHIS', this);
      // console.log('this.dataValues.config', this.dataValues.config);
      // // console.log('this.config', this.config);
      // // console.log('this.config.toString()', this.config.toString());
      // console.log('this.filepath', this.filepath);
      return JSON.parse(this.dataValues.periodic_config);
    },
  },
  setterMethods: {
    periodic_config: function(value) {
      this.setDataValue('periodic_config', JSON.stringify(value));
    },
  },
};

module.exports = {
  scheme,
  options,
};