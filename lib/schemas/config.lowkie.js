'use strict';
const lowkie = require('lowkie');
const configSchema = lowkie.Schema({
  filepath: String,
  environment: String,
  container: {
    type: String,
    default: 'periodicjs.container.default',
  },
  config: Object,
});
/**
 * name_of_file: string (e.g. 'content/config/extensions.json','content/config/environment/development.json','content/config/extensions/peridicjs.ext.dbseed.json')
application_environment: string
settings: schema_type_mixed
 */

module.exports = configSchema;