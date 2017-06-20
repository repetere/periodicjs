'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
const periodic = require('../../../index');
const periodicClass = require('../../../lib/periodicClass');
const config = require('../../../lib/init/config');
const configSequelizeSchema = require('../../../lib/schemas/config.sequelize');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'configTest');
const CoreData = require('periodicjs.core.data');
const initTestConfigJsonFile = path.join(initTestPathDir, 'content/config/config.json');
const configTestConfigJson = require('../../mock/config/config_test_config');
let configPeriodic;
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
require('mocha-sinon');

describe('Periodic Init Config', function() {
  this.timeout(10000);
  before('initialize config test periodic dir', (done) => {
    fs.ensureDir(initTestPathDir)
      .then(() => {
        return fs.ensureDir(path.join(initTestPathDir, 'content/config'))
      })
      .then(() => {
        return fs.ensureFile(initTestConfigJsonFile)
      })
      .then(() => {
        return fs.outputJson(initTestConfigJsonFile, configTestConfigJson({
          dbpathprefix: initTestPathDir,
          settingsProp: {
            logger: {
              use_winston_logger: false,
            },
          },
        }));
      })
      .then(() => {
        // process.env.ENV = 'test';
        configPeriodic = new periodicClass({});
        configPeriodic.init({
            app_root: initTestPathDir,
            cli: true,
            environment: 'test',
          })
          .then(done.bind(done, undefined))
          .catch(done);
      }).catch(done);
  });
  describe('loadConfiguration', () => {
    it('should return a promise', (done) => {
      const testConfigPeriodic = Object.assign({}, configPeriodic);
      const configLoadPromise = config.loadConfiguration.call(testConfigPeriodic);
      expect(configLoadPromise).to.be.a('promise');
      expect(configLoadPromise).to.eventually.eql(true);

      const testErrorConfigPeriodic = Object.assign({}, configPeriodic);
      Object.defineProperty(testErrorConfigPeriodic, 'settings', {
        enumerable: false,
        configurable: false,
        writable: false,
      });
      const configErrorLoadPromise = config.loadConfiguration.call(testErrorConfigPeriodic);
      configErrorLoadPromise
        .then((config) => {
          // console.log({ config });
          done(new Error('was not supposed to succeed'));
        })
        .catch(configError => {
          // console.log({ configError });
          expect(configError).to.be.an('error');
          done();
        });
      expect(configErrorLoadPromise).to.eventually.be.rejected;
    });
    it('should set the config configuration and settings properly', () => {
      const configTestJson = configTestConfigJson({
        dbpathprefix: initTestPathDir,
        settingsProp: {
          logger: {
            use_winston_logger: false,
          },
        },
      });
      expect(configPeriodic.config.configuration).to.eql(configTestJson.configuration);
      expect(configPeriodic.settings.name).to.eql(configTestJson.settings.name);
    });
    it('should handle errors', () => {
      expect(config.loadConfiguration()).to.eventually.be.rejected;
    });
    it('should handle invalid configuration types', (done) => {

      Promise.all([
          (new Promise((resolve, reject) => {
            const invalidConfigurationType = configTestConfigJson({
              config_type: 'invalidConfigType',
              dbpathprefix: initTestPathDir,
              settingsProp: {
                logger: {
                  use_winston_logger: false,
                },
              },
            });
            const testInvalidPeriodicConfig = {
              config: Object.assign({
                app_root: initTestPathDir,
              }, invalidConfigurationType)
            };
            config.loadConfiguration.call(testInvalidPeriodicConfig, invalidConfigurationType.configuration)
              .then(() => {
                reject(new Error('was not supposed to succeed'));
              })
              .catch(e => {
                expect(e.message).to.eql('invalid configuration type');
                resolve(true);
              });
          })),
          new Promise((resolve, reject) => {
            const config_configuration_db_invalid = configTestConfigJson({
              db: 'invalidDB',
              dbpathprefix: initTestPathDir
            });
            const invalidTestPeriodicDbConfig = {
              config: Object.assign({
                app_root: initTestPathDir,
              }, config_configuration_db_invalid)
            };
            config.loadConfiguration.call(invalidTestPeriodicDbConfig, config_configuration_db_invalid.configuration)
              .then(() => {
                reject(new Error('was not supposed to succeed'));
              })
              .catch(e => {
                expect(e.message).to.eql('invalid configuration db');
                resolve(true);
              });
          })
        ])
        .then((result) => {
          // console.log({ result });
          done();
        })
        .catch(done);

    });
  });
  describe('configureLowkie', () => {
    it('should handle errors', () => {
      expect(config.configureLowkie()).to.eventually.be.rejected;
    });
  });
  describe('configureMongoose', () => {
    it('should handle errors', () => {
      expect(config.configureMongoose()).to.eventually.be.rejected;
    });
    it('should connect using mongo', (done) => {
      const mongoconfig = configTestConfigJson({
        db: 'mongoose',
        db_config_options: {
          "url": "mongodb://localhost:27017/test_config_db",
          "connection_options": {}
        },
        settingsProp: {
          logger: {
            use_winston_logger: false,
          },
        },
      });
      const mongoPeriodicInstance = {
        config: Object.assign({
          app_root: initTestPathDir,
        }, mongoconfig),
        core: {
          data: CoreData,
        },
        dbs: new Map(),
        datas: new Map(),
      };
      config.loadConfiguration.call(mongoPeriodicInstance, mongoconfig.configuration)
        .then((result) => {
          expect(result).to.be.true;
          expect(mongoPeriodicInstance.datas.has('configuration')).to.be.true;
          expect(mongoPeriodicInstance.dbs.has('configuration')).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should log disconnect messages using mongo', (done) => {
      const spy = sinon.spy();
      const mongoconfig = configTestConfigJson({
        db: 'mongoose',
        db_config_options: {
          "url": "mongodb://localhost:27017/test_config_db",
          "connection_options": {}
        },
        settingsProp: {
          logger: {
            use_winston_logger: false,
          },
        },
      });
      const mongoPeriodicInstance = {
        config: Object.assign({
          app_root: initTestPathDir,
        }, mongoconfig),
        core: {
          data: CoreData,
        },
        dbs: new Map(),
        datas: new Map(),
        logger: {
          error: spy,
        }
      };

      config.loadConfiguration.call(mongoPeriodicInstance, mongoconfig.configuration)
        .then((result) => {
          expect(result).to.be.true;
          mongoPeriodicInstance.dbs.get('configuration').on('disconnected', () => {
            expect(spy.called).to.be.true;
            done();
          });
          mongoPeriodicInstance.dbs.get('configuration').emit('disconnected');
        })
        .catch(done);
    });
    /*
    it('should close mongo connection after node process ends', (done) => {
      const processExitSpy = sinon.spy();
      const sillySpy = sinon.spy();
      const errorSpy = sinon.spy();
      process.exit = sinon.stub(process, 'exit', processExitSpy);
      const mongoconfig = configTestConfigJson({
        db: 'mongoose',
        db_config_options: {
          "url": "mongodb://localhost:27017/test_config_db2",
          "connection_options":{}
        }
      });
      const mongoPeriodicInstance = {
        config: Object.assign({
          app_root: initTestPathDir,
        }, mongoconfig),
        core: {
          data: CoreData,
        },
        dbs: new Map(),
        datas: new Map(),
        logger: {
          silly:sillySpy,
          error:errorSpy,
        }
      };

      config.loadConfiguration.call(mongoPeriodicInstance, mongoconfig.configuration)
        .then((result) => {
          expect(result).to.be.true;
          mongoPeriodicInstance.dbs.get('configuration').once('disconnected', () => {
            expect(processExitSpy.called).to.be.true;
            expect(sillySpy.called).to.be.true;
            expect(errorSpy.called).to.be.true;
            process.exit.restore();
            // done();
          });
          process.emit('SIGINT');
        })
        .catch(done);
    });*/
  });
  describe('configureSequelize', () => {
    it('should handle errors', () => {
      expect(config.configureSequelize()).to.eventually.be.rejected;
    });
    it('should connect using sql', (done) => {
      const sqlconfig = configTestConfigJson({
        db: 'sequelize',
        db_config_options: {
          "database": "travis_ci_test",
          "username": "",
          "password": "",
          "connection_options": {
            "dialect": "postgres",
            "port": 5432,
            "host": "127.0.0.1",
            "logging": false
          },
        },
        settingsProp: {
          logger: {
            use_winston_logger: false,
          },
        },
      });
      const sqlPeriodicInstance = {
        config: Object.assign({
          app_root: initTestPathDir,
        }, sqlconfig),
        core: {
          data: CoreData,
        },
        dbs: new Map(),
        datas: new Map(),
      };
      config.loadConfiguration.call(sqlPeriodicInstance, sqlconfig.configuration)
        .then((result) => {
          expect(result).to.be.true;
          expect(sqlPeriodicInstance.datas.has('configuration')).to.be.true;
          expect(sqlPeriodicInstance.dbs.has('configuration')).to.be.true;
          done();
        })
        .catch(done);
    });
  });
  describe('configuration sql schema json', () => {
    it('should store json configurations in sql', () => {
      expect(configSequelizeSchema.options.getterMethods.config.call({
        dataValues: {
          config: '{"data":true}'
        }
      })).to.eql({ data: true });
    });
    it('should store json values in sql', () => {
      const mockThis = {
        // config:false,
        setDataValue: function(prop, val) {
          this[prop] = val;
        }
      }
      configSequelizeSchema.options.setterMethods.config.call(mockThis, { data: true });
      expect(mockThis.config).to.eql(JSON.stringify({ data: true }))
    });
  });
  describe('loadAppSettings', () => {
    it('should attempt to load settings from configuration db', (done) => {
      const testConfigPeriodic = Object.assign({}, configPeriodic);
      // console.log({ testConfigPeriodic });
      config.loadAppSettings.call(configPeriodic)
        .then((updatedSettings) => {
          // console.log({ updatedSettings });
          expect(updatedSettings).to.eql(configPeriodic.settings);
          done();
        })
        .catch(done);
    });
    it('should override settings from config.json', (done) => {
      const ORIGINALNAME = 'ORIGINAL NAME';
      const testPeriodicInstance = {
        config: {
          process: {
            runtime: 'test',
          },
        },
        settings: {
          name: ORIGINALNAME,
        },
        status: {
          emit: () => {}
        },
        configuration: {
          load: () => new Promise((resolve, reject) => {
            resolve({
              name: 'ENV SPECIFIC NAME',
            });
          }),
        },
      };
      config.loadAppSettings.call(testPeriodicInstance)
        .then((updatedSettings) => {
          expect(testPeriodicInstance.settings.name).to.eql(ORIGINALNAME);
          done();
        })
        .catch(done);
    });
    it('should merge settings from env', (done) => {
      const ENVNAME = 'ENV SPECIFIC NAME';
      const testPeriodicInstance = {
        config: {
          process: {
            runtime: 'test',
          },
        },
        settings: {
          // name:ORIGINALNAME,
        },
        status: {
          emit: () => {}
        },
        configuration: {
          load: () => new Promise((resolve, reject) => {
            resolve({
              config: {
                name: ENVNAME,
              }
            });
          }),
        },
      };
      config.loadAppSettings.call(testPeriodicInstance)
        .then((updatedSettings) => {
          expect(testPeriodicInstance.settings.name).to.eql(ENVNAME);
          done();
        })
        .catch(done);
    });
    it('should return a promise', () => {
      // const loadSpy = sinon.spy();
      const testPeriodicInstance = {
        config: {
          process: {
            runtime: 'test',
          },
        },
        configuration: {
          load: () => new Promise((resolve, reject) => { resolve(true) }),
        },
        status: {
          emit: () => {},
        },
      };
      const configLoadAppPromise = config.loadAppSettings.call(testPeriodicInstance);
      expect(configLoadAppPromise).to.be.a('promise');
    });
    it('should handle errors', (done) => {
      function foo() { throw new Error('Error On this.configuration.load'); }
      const testPeriodicInstance = {
        config: {
          process: {
            runtime: 'test',
          },
        },
        configuration: {
          load: () => {},
        },
      };
      const fooSpy = sinon.stub(testPeriodicInstance.configuration, 'load', foo);
      config.loadAppSettings.call(testPeriodicInstance)
        .then((m) => {
          done(new Error('was not supposed to succeed'));
        })
        .catch((m) => {
          expect(fooSpy.threw()).to.be.ok;
          done();
        });
    });
  });
  after('remove config test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});