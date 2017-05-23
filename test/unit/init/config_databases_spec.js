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
        core: {
          data: {
            create: createSpy,
          },
        },
      };
      const mockOptions = {
        resolve: resolveSpy,
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
    // it('should resolve as true', () => {
    //   const testModelDir = path.join(initTestPathDir, 'content/config/databases/standard/models');
    //   const resolveSpy = sinon.spy();
    //   const createSpy = sinon.spy();
    //   const mockThis = {
    //     dbs: new Map(),
    //   };
    //   const mockOptions = {
    //     resolve: resolveSpy,
    //     periodic_db_name: 'default',
    //     db: {},
    //     modelFiles: [],
    //   };
    //   config.assignSequelizeModels.call(mockThis, mockOptions);
    //   expect(resolveSpy.calledWith(true)).to.be.true;
    // });
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
        },
      };
      const sequelizeDB = new Sequelize(dboptions.database, dboptions.username, dboptions.password, dboptions.connection_options);
      const resolveSpy = sinon.spy();
      const createSpy = sinon.spy();
      const mockThis = {
        dbs: new Map(),
        datas: new Map(),
        core: {
          data: {
            create: createSpy,
          },
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
        db: sequelizeDB,
        modelFiles: fs.readdirSync(testModelDir),
        modelDirPath: testModelDir,
      };
      // console.log(fs.readdirSync(path.join(initTestPathDir,'content/config/databases/standard/models')))
      config.assignSequelizeModels.call(mockThis, mockOptions);
    });
  });
  after('remove config test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});