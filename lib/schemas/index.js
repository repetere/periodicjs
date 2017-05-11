'use strict';
const lowkieConfigSchema = require('./config.lowkie');
const mongooseConfigSchema = require('./config.mongoose');
const configSchemas = {
  lowkie: lowkieConfigSchema,
  mongoose: mongooseConfigSchema,
};

module.exports = configSchemas;