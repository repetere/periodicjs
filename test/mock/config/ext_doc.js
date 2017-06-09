'use strict';
const crypto = require('crypto');

module.exports = (options = {}) => {
  const ext = Object.assign({},{
      "name": "periodicjs.ext.test",
      "source": "npm",
      "version": "0.4.5",
      "enabled": true,
      "periodic_type": 5,
      "periodic_compatibility": "10.0.0",
      "periodic_config": {
        "reactadmin": {
          "navigation": "node_modules/periodicjs.ext.reactadmin/views/reactadmin/components/navigation.manifest.js",
          "manifests": [
            "node_modules/periodicjs.ext.reactadmin/views/reactadmin/manifests",
          ],
          "unauthenticated_manifests": [
            "node_modules/periodicjs.ext.reactadmin/views/public/home/",
          ],
        },
      },
      "periodic_dependencies": [
        {
          "extname": "periodicjs.ext.mailer",
          "version": "~10.0.0",
        },
        {
          "extname": "periodicjs.ext.login",
          "version": "~11.0.0"
        },
        {
          "extname": "periodicjs.ext.uac",
          "version": "~7.0.0"
        },
        {
          "extname": "periodicjs.ext.oauth2server",
          "version": "5.0.0"
        }
      ],
      "author": {
        "name": "yaw joseph etse",
        "email": "yaw.etse@gmail.com"
      },
      "contributors": [
        { "name": "jan" },
        { "name": "iris" }
      ],
      "description": "admin center",
      "createdat": Date.now(),
      "updatedat": Date.now(),
      "_id": crypto.createHash('md5').update(`${new Date().valueOf}${Math.random()}`).digest('hex'), 
    },options);  
  return ext;
}
