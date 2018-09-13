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
      field:'_attributes',
      // allowNull: false,
      get() {
        return this.getDataValue('_attributes')? JSON.parse(this.getDataValue('_attributes')):{};
      },
      set(val) {
        this.setDataValue('_attributes', JSON.stringify(val, null, 2));
      },
    },
    entity_attributes: {
      type: Sequelize.TEXT,
      // allowNull: false,
      get() {
        return this.getDataValue('entity_attributes')? JSON.parse(this.getDataValue('entity_attributes')):{};
      },
      set(val) {
        this.setDataValue('entity_attributes', JSON.stringify(val, null, 2));
      },
    },
    contenttypeattributes: {
      type: Sequelize.TEXT,
      // allowNull: false,
      get() {
        return this.getDataValue('contenttypeattributes')? JSON.parse(this.getDataValue('contenttypeattributes')):{};
      },
      set(val) {
        this.setDataValue('contenttypeattributes', JSON.stringify(val, null, 2));
      },
    },
    extensionattributes: {
      type: Sequelize.TEXT,
      // allowNull: false,
      get() {
        return this.getDataValue('extensionattributes')? JSON.parse(this.getDataValue('extensionattributes')):{};
      },
      set(val) {
        this.setDataValue('extensionattributes', JSON.stringify(val, null, 2));
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