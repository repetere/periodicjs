'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const extensionSchema = lowkie.Schema({
  name: String,
  require: String,
  source: String,
  version: String,
  enabled: Boolean,
  type: Number, //0-core, 1-communication, 2-auth, 3-uac, 4-api, 5-admin,6-data,7-ui
  priority: Number,
  periodic_compatibility: String,
  periodic_config: Schema.Types.Mixed,
  periodic_dependencies: Schema.Types.Mixed,
  author: Schema.Types.Mixed,
  contributors: Schema.Types.Mixed,
  description: String,
  createdat: {
    type: Date,
    'default': Date.now,
  },
  updatedat: {
    type: Date,
    'default': Date.now,
  },
});

module.exports = extensionSchema;

/**
 *
 *    {
      "name": "periodicjs.ext.oauth2server",
      "version": "3.1.0",
      "periodicCompatibility": "9.0.0",
      "installed": true,
      "enabled": true,
      "date": "2017-05-05T01:37:24.140Z",
      "periodicConfig": {
        "periodicCompatibility": "9.0.0",
        "periodicDependencies": [
          {
            "extname": "periodicjs.ext.login",
            "version": "~7.0.3"
          }
        ],
        "periodicjs.ext.reactadmin": {
          "manifests": [
            "node_modules/periodicjs.ext.oauth2server/views/reactadmin/manifests"
          ],
          "unauthenticated_manifests": [
            "node_modules/periodicjs.ext.oauth2server/views/reactadmin/unauthenticated_manifests"
          ],
          "navigation": "node_modules/periodicjs.ext.oauth2server/views/reactadmin/components/navigation.manifest.js"
        }
      }
    },
 *
 */