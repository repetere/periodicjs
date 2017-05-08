'use strict';
const path = require('path');
const fs = require('fs-extra');
const lowkieConfigSchema = require('../schemas/config.lowkie');
const configSchemas = {
  lowkie: lowkieConfigSchema,
};

function configureLowkie() {

  return new Promise((resolve, reject) => {
    try {
      const __CONFIG_DB = path.resolve(this.config.app_root, this.config.configuration.options.dbpath);

      // //Basic usage (loki)
      const lowkie = require('lowkie');
      lowkie.connect(__CONFIG_DB)
        .then((db) => {
          // console.log('connected db', db);
          if (this.config.debug) {
            this.logger.silly('LOWKIE: initialized configuration db');
          }
        })
        .catch(reject);
      lowkie.connection.on('connectionError', (e) => {
        console.error('LOWKIE: error connecting to configuration db', e);
        reject(e);
      });
      lowkie.connection.on('connecting', (connectdata) => {
        if (this.config.debug) {
          this.logger.silly('LOWKIE: now trying to connect to configuration db');
        }
      });
      lowkie.connection.once('connected', (connectdata) => {
        if (this.config.debug) {
          this.logger.silly('LOWKIE: connected to configuration db', { connectdata });
        }
        const configurationModel = lowkie.model('configuration', configSchemas.lowkie);
        const CoreDataAdapter = this.core.data.create({
          adapter: 'loki',
          model: configurationModel,
        });
        // var kittySchema = lowkie.Schema({
        //   name: String,
        //   entitytype: {
        //     type: String,
        //     default: 'cat',
        //   },
        //   description: String,
        // });
        this.datas.set('configuration', CoreDataAdapter);

        // this.logger.silly({ __CONFIG_DB }, 'config lowkie this', this);
        resolve(true);
      });

      // lowkie.connect();
      // const AdapterInterface = require('periodicjs.core.data');
      // const ExampleSchema = require('./some/path/to/schema');
      // let ExampleModel = lowkie.model('Example', ExampleSchema);
      // let Adapter = AdapterIterface.create({ adapter: 'mongo', model: ExampleModel }); //example core datum for the Example lowkie schema
      // let exampleDocument = { //example mongo document
      //   title: 'example document',
      //   createdat: new Date(),
      // };
      // lowkie.once('open', () => {
      //   // The model property in above example can also be set to the name of the registered model. 
      //   // See documentation for full list of options for .create method
      //   Adapter.create({ newdoc: exampleDocument })

      //   //Adapters also have a stream method which resolves with a stream of query data
      //   let writeStream = require('fs').createWriteStream('./some/path/to/file');
      //   Adapter.stream({... })
      //     .then(dbstream => {
      //       dbstream.pipe(writeStream);
      //     });
      // });
    } catch (e) {
      reject(e);
    }
  });
}
/*
function configureMongoose() {
  // console.log('config lowkie this', this);

  return new Promise((resolve, reject) => {
    try {
      //Basic usage (mongodb)
      // const mongoose = require('mongoose');
      // mongoose.connect();
      // const AdapterInterface = require('periodicjs.core.data');
      // const ExampleSchema = require('./some/path/to/schema');
      // let ExampleModel = mongoose.model('Example', ExampleSchema);
      // let Adapter = AdapterIterface.create({ adapter: 'mongo', model: ExampleModel }); //example core datum for the Example mongoose schema
      // let exampleDocument = { //example mongo document
      //     title:'example document',
      //     createdat: new Date(),
      // };
      // mongoose.once('open', () => {
      //     // The model property in above example can also be set to the name of the registered model. 
      //     // See documentation for full list of options for .create method
      //     Adapter.create({ newdoc: exampleDocument })

      //     //Adapters also have a stream method which resolves with a stream of query data
      //     let writeStream = require('fs').createWriteStream('./some/path/to/file');
      //     Adapter.stream({...})
      //     	.then(dbstream => {
      //         	dbstream.pipe(writeStream);
      //         });
      // });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}
*/

/**
 * reads content/config/config.json for configurationg database
 * 
 * @returns Promise loadConfiguration sets up application config db
 */
function loadConfiguration() {
  const __CONFIG_DIR = path.resolve(this.config.app_root, 'content/config');
  const __CONFIG_JSON_PATH = path.join(__CONFIG_DIR, 'config.json');

  return new Promise((resolve, reject) => {
    try {
      // resolve(this);
      fs.readJson(__CONFIG_JSON_PATH)
        .then(app_configuration_settings => {
          this.config.configuration = app_configuration_settings.configuration;
          return configureLowkie.call(this);
          // console.log({ app_configuration_settings });
          // resolve(app_configuration_settings);
        })
        .then(configdb => {
          resolve(configdb);
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  })
}
module.exports = loadConfiguration;