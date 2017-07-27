'use strict';
const Sequelize = require('sequelize');

module.exports = (modelName) => {
  return {
    _id: {
      type: Sequelize.INTEGER,
      // type: Sequelize.UUID,
      primaryKey: true,
      autoIncrement: true,
    },
    entitytype: {
      type: Sequelize.STRING,
      default: modelName,
    },
    _attributes: {
      type: Sequelize.TEXT,
      // allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('_attributes'));
      },
      set(val) {
        this.setDataValue('_attributes', JSON.stringify(val));
      },
    },
    entity_attributes: {
      type: Sequelize.TEXT,
      // allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('entity_attributes'));
      },
      set(val) {
        this.setDataValue('entity_attributes', JSON.stringify(val));
      },
    },
    contenttypeattributes: {
      type: Sequelize.TEXT,
      // allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('contenttypeattributes'));
      },
      set(val) {
        this.setDataValue('contenttypeattributes', JSON.stringify(val));
      },
    },
    extensionattributes: {
      type: Sequelize.TEXT,
      // allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('extensionattributes'));
      },
      set(val) {
        this.setDataValue('extensionattributes', JSON.stringify(val));
      },
    },
    random: Sequelize.FLOAT,
    createdat: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedat: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  };
};