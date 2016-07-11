'use strict';

const Promisie = require('promisie');
const http = require('http');

let create_server = function (options) {
  let periodicLib = options.periodicLib;
  let periodicjs = options.periodicjs;
  let mongoose = options.mongoose;
  let mongoConnected = options.mongoConnected;
  let periodicExpressApp = options.periodicExpressApp;

  return new Promise((resolve, reject) => {
    let runApp = function () {
      mongoConnected = true;
      try {
        periodicExpressApp = http.createServer(periodicjs.expressapp).listen(periodicjs.port, function (e) {
          console.log('http server started e', e);
          if (e) {
            reject(e);
          }
          else {
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
      catch (e) {
        reject(e);
      }
    };
  
    Promisie.promisify(periodicLib.init, periodicLib)({})
      .then(periodicInitialized => {
        console.log('CREATING SERVER create_server');
        periodicjs = periodicInitialized;
        mongoose = periodicjs.mongoose;

        if (mongoose.Connection.STATES.connected === mongoose.connection.readyState) {
          if (mongoConnected === false) {
            return runApp();
          }
        }
        else {
          mongoose.connection.on('connected', () => {
            if (mongoConnected === false) {
              return runApp();
            }
          });
        }
      })
      // .then(resolvedApp => resolve)
      .catch(e=>reject);
  });
};

module.exports = create_server;