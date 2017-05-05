'use strict';
const lowkie = require('lowkie');
const configSchema = lowkie.Schema({
  name: String,
  entitytype: {
    type: String,
    default: 'configuration',
  },
  description: String,
});

module.exports = configSchema;