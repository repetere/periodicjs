'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    unique: true,
  },
  name: {
    type: Sequelize.STRING,
    primaryKey: true,
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
  periodic_type: {
    type: Sequelize.INTEGER,
  },
  periodic_priority: {
    type: Sequelize.INTEGER,
  },
  periodic_compatibility: {
    type: Sequelize.STRING,
    defaultValue: 'periodicjs.container.default',
  },
  periodic_config: Sequelize.TEXT,
  periodic_dependencies: Sequelize.TEXT,
  author: Sequelize.TEXT,
  contributors: Sequelize.TEXT,
  description: Sequelize.TEXT,
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
    periodic_config: function () {
      try {
        return JSON.parse(this.getDataValue('periodic_config')); // return JSON.parse(this.dataValues.periodic_config);
      } catch (e) {
        console.error(e);
        return {};
      }
    },
    periodic_dependencies: function () {
      try {
        return JSON.parse(this.getDataValue('periodic_dependencies')); // return JSON.parse(this.dataValues.periodic_config);
      } catch (e) {
        console.error(e);
        return {};
      }
    },
    author: function () {
      try {        
        return JSON.parse(this.getDataValue('author')); // return JSON.parse(this.dataValues.periodic_config);
      } catch (e) {
        console.error(e);
        return {};
      }
    },
    contributors: function () {
      try {
        return JSON.parse(this.getDataValue('contributors')); // return JSON.parse(this.dataValues.periodic_config);
      } catch (e) {
        console.error(e);
        return {};
      }
    },
    description: function () {
      try {
        return JSON.parse(this.getDataValue('description')); // return JSON.parse(this.dataValues.periodic_config);
      }
      catch (e) {
        console.error(e);
        return {};
      }
    },
  },
  setterMethods: {
    periodic_config: function(value) {
      this.setDataValue('periodic_config', JSON.stringify(value));
    },
    author: function(value) {
      this.setDataValue('author', JSON.stringify(value));
    },
    periodic_dependencies: function(value) {
      this.setDataValue('periodic_dependencies', JSON.stringify(value));
    },
    contributors: function(value) {
      this.setDataValue('contributors', JSON.stringify(value));
    },
    description: function(value) {
      this.setDataValue('description', JSON.stringify(value));
    },
  },
};

module.exports = {
  scheme,
  options,
};