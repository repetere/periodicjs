'use strict';

const Promisie = require('promisie');
const http = require('http');

let mongo_start = function (options) {
  let periodicLib = options.periodicLib;
  let periodicjs = options.periodicjs;
  let mongoose = options.mongoose;
  let mongoConnected = options.mongoConnected;
  let periodicExpressApp = options.periodicExpressApp;

  return new Promise((resolve, reject) => {
    Promisie.promisify(periodicLib.init, periodicLib)({})
      .then(periodicInitialized => {
        periodicjs = periodicInitialized;
        mongoose = periodicjs.mongoose;

        if (mongoose.Connection.STATES.connected === mongoose.connection.readyState) {
          if (mongoConnected === false) {
            resolve({
              periodicExpressApp,
              periodicLib,
              periodicjs,
              mongoose,
              mongoConnected,
            });
          }
        }
        else {
          mongoose.connection.on('connected', () => {
            if (mongoConnected === false) {
              resolve({
                periodicExpressApp,
                periodicLib,
                periodicjs,
                mongoose,
                mongoConnected,
              });
            }
          });
        }
      })
      .catch(e=>reject);
  });
};

module.exports = mongo_start;