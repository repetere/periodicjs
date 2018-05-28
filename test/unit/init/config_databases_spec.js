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
const extDoc = require('../../mock/config/ext_doc');
let configPeriodic;
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
require('mocha-sinon');

describe('Periodic Init Config', function() {
  this.timeout(10000);
  before('initialize config test periodic dir', (done) => {
    fs.ensureDir(initTestPathDir)
      .then(() => {
        return fs.ensureDir(path.join(initTestPathDir, 'content/config'));
      })
      .then(() => {
        return fs.ensureFile(initTestConfigJsonFile);
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
  describe('getContentDBModelDir', () => {
    it('should return the content model directory path', () => {
      expect(config.getContentDBModelDir.call({
        config: {
          app_root: 'path/to/dir',
        },
      }, 'test')).to.eql('path/to/dir/content/config/databases/test/models');
    });
  });
  describe('getDBModelDir', () => {
    it('should return the content model directory path', () => {
      expect(config.getDBModelDir.call({
        config: {
          app_root: 'path/to/dir',
        },
      }, { db_config_type: 'content', periodic_db_name: 'test', })).to.eql('path/to/dir/content/config/databases/test/models');
    });
  });
  describe('assignLowkieModels', () => {
    it('should resolve as true', () => {
      const testModelDir = path.join(initTestPathDir, 'content/config/databases/standard/models');
      const resolveSpy = sinon.spy();
      const createSpy = sinon.spy();
      const mockThis = {
        dbs: new Map(),
      };
      const mockOptions = {
        resolve: resolveSpy,
        dboptions: {},
        periodic_db_name: 'almTest',
        db: {},
        modelFiles: [],
      };
      config.assignLowkieModels.call(mockThis, mockOptions);
      expect(resolveSpy.calledWith(true)).to.be.true;
    });
    it('should create lowkie models', () => {
      const testModelDir = path.join(initTestPathDir, 'content/config/databases/standard/models');
      const resolveSpy = sinon.spy();
      const createSpy = sinon.spy();
      const mockThis = {
        dbs: new Map(),
        datas: new Map(),
        models: new Map(),
        core: {
          data: {
            create: createSpy,
          },
        },
      };
      const mockOptions = {
        resolve: resolveSpy,
        dboptions: {},
        periodic_db_name: 'default',
        db: {},
        modelFiles: fs.readdirSync(testModelDir),
        modelDirPath: testModelDir,
      };
      // console.log(fs.readdirSync(path.join(initTestPathDir,'content/config/databases/standard/models')))
      config.assignLowkieModels.call(mockThis, mockOptions);
      expect(createSpy.called).to.be.true;
      expect(mockThis.dbs.size).to.be.greaterThan(0);
      expect(mockThis.datas.size).to.be.greaterThan(0);
      expect(resolveSpy.calledWith(true)).to.be.true;
    });
  });
  describe('assignMongooseModels', () => {
    it('should resolve as true', () => {
      const testModelDir = path.join(initTestPathDir, 'content/config/databases/standard/models');
      const resolveSpy = sinon.spy();
      const createSpy = sinon.spy();
      const mockThis = {
        dbs: new Map(),
      };
      const mockOptions = {
        resolve: resolveSpy,
        dboptions: {},
        periodic_db_name: 'default',
        db: {},
        modelFiles: [],
      };
      config.assignMongooseModels.call(mockThis, mockOptions);
      expect(resolveSpy.calledWith(true)).to.be.true;
    });
    it('should create mongoose models', () => {
      const testModelDir = path.join(initTestPathDir, 'content/config/databases/standard/models');
      const resolveSpy = sinon.spy();
      const createSpy = sinon.spy();
      const mockThis = {
        dbs: new Map(),
        datas: new Map(),
        models: new Map(),
        core: {
          data: {
            create: createSpy,
          },
        },
      };
      const mockOptions = {
        resolve: resolveSpy,
        periodic_db_name: 'default',
        db: require('mongoose'),
        dboptions: {},
        modelFiles: fs.readdirSync(testModelDir),
        modelDirPath: testModelDir,
      };
      // console.log(fs.readdirSync(path.join(initTestPathDir,'content/config/databases/standard/models')))
      config.assignMongooseModels.call(mockThis, mockOptions);
      expect(createSpy.called).to.be.true;
      expect(mockThis.dbs.size).to.be.greaterThan(0);
      expect(mockThis.datas.size).to.be.greaterThan(0);
      expect(resolveSpy.calledWith(true)).to.be.true;
    });
  });
  describe('assignSequelizeModels', () => {
    it('should create sequelize models', (done) => {
      const testModelDir = path.join(initTestPathDir, 'content/config/databases/standard/models');
      const Sequelize = require('sequelize');
      const dboptions = {
        database: 'travis_ci_test',
        username: '',
        password: '',
        connection_options: {
          dialect: 'postgres',
          port: 5432,
          host: '127.0.0.1',
          logging: false,
        },
      };
      const sequelizeDB = new Sequelize(dboptions.database, dboptions.username, dboptions.password, dboptions.connection_options);
      const resolveSpy = sinon.spy();
      const createSpy = sinon.spy();
      const mockThis = {
        dbs: new Map(),
        datas: new Map(),
        models: new Map(),
        core: {
          data: {
            create: createSpy,
          },
        },
        config: {
          debug:true,
        },
      };
      const mockOptions = {
        resolve: (val) => {
          resolveSpy(val);
          expect(createSpy.called).to.be.true;
          expect(mockThis.dbs.size).to.be.greaterThan(0);
          expect(mockThis.datas.size).to.be.greaterThan(0);
          expect(resolveSpy.calledWith(true)).to.be.true;
          done();
        },
        reject: done,
        periodic_db_name: 'default',
        dboptions: {},
        db: sequelizeDB || {
          sync: () => new Promise((resolve, reject) => { })
        },
        modelFiles: fs.readdirSync(testModelDir),
        modelDirPath: testModelDir,
      };
      // console.log(fs.readdirSync(path.join(initTestPathDir,'content/config/databases/standard/models')))
      try {
        
        config.assignSequelizeModels.call(mockThis, mockOptions);
      } catch (e) {
        console.log('Cannot connect to Postgres')
        done();
      }
    });
  });
  describe('connectLowkieDB', () => {
    it('should handle errors', () => {
      expect(config.connectLowkieDB()).to.eventually.be.rejected;
    });
    it('should connect to loki', () => {
      const mockOptions = {
        periodic_db_name: 'default',
        db_config_type: 'content',
        options: {
          dbpath: path.join(initTestPathDir, 'content/config/settings/config_db.json'),
        },
      };
      const mockThis = {};
      expect(config.connectLowkieDB.call(mockThis, mockOptions)).to.eventually.be.fulfilled;
    });
  });
  describe('connectMongooseDB', () => {
    it('should handle errors', () => {
      expect(config.connectMongooseDB()).to.eventually.be.rejected;
    });
    it('should connect to mongo', () => {
      const mockOptions = {
        periodic_db_name: 'default',
        db_config_type: 'content',
        options: {
          url: 'mongodb://localhost:27017/config_db',
          connection_options: {},
        },
      };
      const mockThis = {
        config: {
          app_root: initTestPathDir,
        },
      };
      expect(config.connectMongooseDB.call(mockThis, mockOptions)).to.eventually.be.fulfilled;
    });
  });
  describe('connectSequelizeDB', () => {
    it('should handle errors', () => {
      expect(config.connectSequelizeDB()).to.eventually.be.rejected;
    });
    it('should connect to sql', () => {
      const mockOptions = {
        periodic_db_name: 'default',
        db_config_type: 'content',
        options: {
          database: 'travis_ci_test',
          username: '',
          password: '',
          connection_options: {
            dialect: 'postgres',
            port: 5432,
            host: '127.0.0.1',
          },
        },
      };
      const mockThis = {
        config: {
          app_root: initTestPathDir,
        },
      };
      expect(config.connectSequelizeDB.call(mockThis, mockOptions)).to.eventually.be.fulfilled;
    });
  });
  describe('connectDB', () => {
    it('should handle errors', () => {
      expect(config.connectDB()).to.eventually.be.rejected;
    });
    it('should connect to loki', () => {
      expect(config.connectDB({ db: 'lowkie', })).to.eventually.be.rejected;
    });
    it('should connect to mongo', () => {
      expect(config.connectDB({ db: 'mongoose', })).to.eventually.be.rejected;
    });
    it('should connect to sql', () => {
      expect(config.connectDB({ db: 'sequelize', })).to.eventually.be.rejected;
    });
    it('should resolve to true if no db specified', () => {
      expect(config.connectDB({ db: 'other', })).to.eventually.eql(true);
    });
  });
  describe('loadDatabases', () => {
    it('should handle errors', () => {
      expect(config.loadDatabases()).to.eventually.be.rejected;
    });
    it('should return true if no databases to connect', (done) => {
      config.loadDatabases.call({
          resources: {
            databases: {
              container: {},
              extensions: {},
            },
          },
          settings: {
            databases: {},
          },
        })
        .then(result => {
          expect(result).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should return connected databases to from settings', (done) => {
      config.loadDatabases.call({
          resources: {
            databases: {
              container: {},
              extensions: {},
            },
          },
          settings: {
            databases: {
              test: {
                db: 'other',
              },
              test2: {
                db: 'other',
              },
            },
          },
        })
        .then(results => {
          expect(results.length).to.eql(2);
          done();
        })
        .catch(done);
    });
  });
  describe('loadExtensions', () => {
    const extNotCompatible = extDoc({ 'periodic_compatibility': '11.0.0', });
    describe('filterRequiredDependencies', () => {
      it('should return true if dependency is not optional', () => {
        expect(config.filterRequiredDependencies({ optional: false, })).to.be.true;
      });
      it('should return false if dependency is optional', () => {
        expect(config.filterRequiredDependencies({ optional: true, })).to.be.false;
      });
    });
    describe('mapForExtensionDependencyName', () => {
      it('should return extension name', () => {
        expect(config.mapForExtensionDependencyName({ extname: 'test', })).to.eql('test');
      });
    });
    describe('checkForRequiredExtensions', () => {
      it('should error if missing required extension', () => {
        const errors = [];
        const ext = {
          name: 'test extension',
        };
        const mockThis = {
          extensions: new Map(),
        };
        const mockOptions = {
          errors,
          reqExt: 'requiredExt',
          ext,
        };
        config.checkForRequiredExtensions.call(mockThis, mockOptions);
        expect(errors).to.have.length.greaterThan(0);
      });
      it('should not error if extension map has extension loaded', () => {
        const errors = [];
        const ext = {
          name: 'requiredExt',
          version: '1.0.0',
        };
        const mockThis = {
          extensions: new Map(
            [
              [ext.name, ], ext,
            ]
          ),
        };
        const mockOptions = {
          errors,
          reqExt: 'requiredExt',
          ext,
        };
        config.checkForRequiredExtensions.call(mockThis, mockOptions);
        expect(errors.length).to.eql(0);
      });
    });
    describe('checkExtensionDependencies', () => {
      it('should error if extension is incompatible with periodic version', () => {
        const errors = [];
        const mockThis = {
          settings: {
            application: {
              version: '10.0.0',
            },
          },
        };
        const mockOptions = {
          errors,
          ext: {
            periodic_compatibility: '11.0.0',
          },
        };
        config.checkExtensionDependencies.call(mockThis, mockOptions);
        expect(errors).to.have.length.greaterThan(0);
      });
      it('should add valid extension to extensions map', () => {
        const errors = [];
        const ext = {
          name: 'testExtension',
          periodic_compatibility: '10.0.0',
        };
        const mockThis = {
          settings: {
            application: {
              version: '10.0.0',
            },
          },
          extensions: new Map(),
        };
        const mockOptions = {
          errors,
          ext,
        };
        config.checkExtensionDependencies.call(mockThis, mockOptions);
        expect(mockThis.extensions.has(ext.name)).to.be.true;
        expect(mockThis.extensions.get(ext.name)).to.eql(ext);
        expect(errors.length).to.eql(0);
      });
    });
    describe('loadExtensions functionality', () => {
      it('should handle errors', () => {
        expect(config.loadExtensions()).to.eventually.be.rejected;
      });
      it('should return true if there are no extensions', (done) => {
        const mockThis = {
          settings: {
            application: {
              exit_on_invalid_extensions: false,
            },
          },
          crud: {
            ext: {
              list: () => {
                return new Promise((resolve, reject) => {
                  resolve([]);
                });
              },
            },
          },
        };
        config.loadExtensions.call(mockThis)
          .then(result => {
            expect(result).to.be.true;
            done();
          })
          .catch(done);
      });
      it('should return reject on error if settings is set ', (done) => {
        const errorSpy = sinon.spy();
        const mockThis = {
          settings: {
            application: {
              version: '10.0.0',
              exit_on_invalid_extensions: true,
            },
          },
          extensions: new Set(),
          crud: {
            ext: {
              list: () => {
                return new Promise((resolve, reject) => {
                  resolve([extNotCompatible, ]);
                });
              },
            },
          },
          logger: {
            error: errorSpy,
          },
        };
        config.loadExtensions.call(mockThis)
          .then(result => {
            done(new Error('Should reject if invalid extension config'));
          })
          .catch(e => {
            expect(errorSpy.called).to.be.true;
            expect(e.message).to.eql('Invalid extension configuration');
            done();
          });
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