'use strict';
const lowkieConfigSchema = require('./config.lowkie');
const mongooseConfigSchema = require('./config.mongoose');
const sequelizeConfigSchema = require('./config.sequelize');
const configSchemas = {
  lowkie: lowkieConfigSchema,
  mongoose: mongooseConfigSchema,
  sequelize: sequelizeConfigSchema,
};

module.exports = configSchemas;