'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    // type: Sequelize.UUID,
    primaryKey: true,
    autoIncrement: true,
  },
  filepath: {
    type: Sequelize.STRING,
  },
  environment: {
    type: Sequelize.STRING,
  },
  container: {
    type: Sequelize.STRING,
    defaultValue: 'periodicjs.container.default',
  },
  config: Sequelize.TEXT,
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
    config: function() {
      // // console.log('getterTHIS', this);
      // console.log('this.dataValues.config', this.dataValues.config);
      // // console.log('this.config', this.config);
      // // console.log('this.config.toString()', this.config.toString());
      // console.log('this.filepath', this.filepath);
      return JSON.parse(this.dataValues.config);
    },
  },
  setterMethods: {
    config: function(value) {
      this.setDataValue('config', JSON.stringify(value));
    },
  },
};

module.exports = {
  scheme,
  options,
};