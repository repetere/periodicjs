'use strict';
const lowkieConfigSchema = require('./config.lowkie');
const mongooseConfigSchema = require('./config.mongoose');
const sequelizeConfigSchema = require('./config.sequelize');
const lowkieExtensionSchema = require('./extension.lowkie');
const mongooseExtensionSchema = require('./extension.mongoose');
const sequelizeExtensionSchema = require('./extension.sequelize');
const schemas = {
  config: {
    lowkie: lowkieConfigSchema,
    mongoose: mongooseConfigSchema,
    sequelize: sequelizeConfigSchema,
  },
  extension: {
    lowkie: lowkieExtensionSchema,
    mongoose: mongooseExtensionSchema,
    sequelize: sequelizeExtensionSchema,
  }
};

module.exports = schemas;