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
const CRUD_ext = require('../../../lib/crud/ext');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'crudEXTTest');
const initTestConfigJsonFile = path.join(initTestPathDir, 'content/config/config.json');
const configTestConfigJson = require('../../mock/config/config_test_config');
let configPeriodic;
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
require('mocha-sinon');
let TEXT_ext;

describe('Periodic Crud Ext', function() {
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
        return fs.copy(path.resolve(__dirname, '../../mock/extensions'), path.join(initTestPathDir, 'node_modules'));
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
  describe('getExtensionPaths', () => {
    it('should throw an error if invalid extension type', () => {
      try {
        CRUD_ext.getExtensionPaths();
      } catch (e) {
        expect(e).to.be.an('error');
      }
      try {
        CRUD_ext.getExtensionPaths({ source: 'local' });
      } catch (e) {
        expect(e).to.be.an('error');
      }
    });
    it('should return extension paths to module folder and periodic extension settings', () => {
      const mockThis = {
        config: {
          app_root: initTestPathDir
        },
      };
      const mockOptions = {
        source: 'npm',
        name: 'testextension',
      };
      const extensionPaths = CRUD_ext.getExtensionPaths.call(mockThis, mockOptions);
      expect(extensionPaths).to.be.an('object');
      expect(extensionPaths.package).to.eql(path.join(mockThis.config.app_root, 'node_modules', mockOptions.name, 'package.json'));
      expect(extensionPaths.ext).to.eql(path.join(mockThis.config.app_root, 'node_modules', mockOptions.name, 'periodicjs.ext.json'));
    });
  });
  describe('getExtensionDoc', () => {
    it('should throw an error if invalid  extension properties', () => {
      try {
        CRUD_ext.getExtensionDoc();
      } catch (e) {
        expect(e).to.be.an('error');
      }
      try {
        CRUD_ext.getExtensionDoc({ source: 'local' });
      } catch (e) {
        expect(e).to.be.an('error');
      }
    });
    it('should require an extension name', () => {
      try {
        const ext_package_json = {};
        const ext_config_json = {};
        const ext_source = {};
        CRUD_ext.getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
      } catch (e) {
        expect(e.message).to.eql('Extension package.json is missing a name');
      }
    });
    it('should require an extension version', () => {
      try {
        const ext_package_json = {
          name: 'test',
        };
        const ext_config_json = {};
        const ext_source = {};
        CRUD_ext.getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
      } catch (e) {
        expect(e.message).to.eql('Extension package.json is missing a version');
      }
    });
    it('should require an extension periodic_type', () => {
      try {
        const ext_package_json = {
          name: 'test',
          version: '10.0.1',
        };
        const ext_config_json = {};
        const ext_source = {};
        CRUD_ext.getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
      } catch (e) {
        expect(e.message).to.eql('Extension periodicjs.ext.json is missing a periodic_type classification (0-core, 1-communication, 2-auth, 3-uac, 4-api, 5-admin,6-data,7-ui)');
      }
    });
    it('should require an extension periodic_priority', () => {
      try {
        const ext_package_json = {
          name: 'test',
          version: '10.0.1',
        };
        const ext_config_json = {
          periodic_type: 0,
        };
        const ext_source = {};
        CRUD_ext.getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
      } catch (e) {
        expect(e.message).to.eql('Extension periodicjs.ext.json is missing a periodic_priority');
      }
    });
    it('should require an extension periodic_compatibility', () => {
      try {
        const ext_package_json = {
          name: 'test',
          version: '10.0.1',
        };
        const ext_config_json = {
          periodic_type: 0,
          periodic_priority: 0,
        };
        const ext_source = {};
        CRUD_ext.getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
      } catch (e) {
        expect(e.message).to.eql('Extension periodicjs.ext.json is missing a periodic_compatibility');
      }
    });
    it('should require an extension periodic_config', () => {
      try {
        const ext_package_json = {
          name: 'test',
          version: '10.0.1',
        };
        const ext_config_json = {
          periodic_type: 0,
          periodic_priority: 0,
          periodic_compatibility: '10.0.0',
        };
        const ext_source = {};
        CRUD_ext.getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
      } catch (e) {
        expect(e.message).to.eql('Extension periodicjs.ext.json is missing a periodic_config');
      }
    });
    it('should return a formatted extension', () => {
      const ext_package_json = {
        name: 'test',
        version: '10.0.1',
      };
      const ext_config_json = {
        periodic_type: 0,
        periodic_priority: 0,
        periodic_compatibility: '10.0.0',
        periodic_config: {},
      };
      const ext_source = {};
      const validExt = CRUD_ext.getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
      expect(validExt).to.have.property('name');
      expect(validExt).to.have.property('version');
      expect(validExt).to.have.property('author');
      expect(validExt).to.have.property('periodic_type');
      expect(validExt).to.have.property('periodic_priority');
      expect(validExt).to.have.property('periodic_compatibility');
      expect(validExt).to.have.property('periodic_config');
      expect(validExt).to.have.property('contributors');
      expect(validExt).to.have.property('description');
      expect(validExt).to.have.property('source');
      expect(validExt).to.have.property('enabled');
      expect(validExt).to.have.property('createdat');
      expect(validExt).to.have.property('updatedat');
    });
  });
  describe('create', () => {
    it('should handle errors', () => {
      expect(CRUD_ext.create()).to.eventually.be.rejected;
    });
    it('should add extension to extension db', (done) => {
      CRUD_ext.create.call(configPeriodic, 'periodicjs.ext.cloudupload')
        .then(createdExtension => {
          TEXT_ext = createdExtension;
          // console.log({ createdExtension });
          expect(createdExtension).to.be.ok;
          expect(createdExtension.name).to.eql('periodicjs.ext.cloudupload');
          expect(createdExtension.source).to.eql('npm');
          expect(createdExtension.enabled).to.eql(true);
          expect(createdExtension._id).to.be.ok;
          // expect
          return configPeriodic.datas.get('extension').load({ query: createdExtension._id, });
        })
        .then(loadedExtension => {
          expect(loadedExtension._id).to.eql(TEXT_ext._id);
          done();
        })
        .catch(done);
      // expect().to.eventually.eql(true);
    });
  });
  describe('update', () => {
    it('should handle errors', () => {
      expect(CRUD_ext.update()).to.eventually.be.rejected;
    });
    it('should update extension in extension db', (done) => {   
      const updatedExt = Object.assign({}, TEXT_ext, {
        enabled: false,
        description: 'updated cloud upload extension',
      });
      // console.log({ updatedExt });
      CRUD_ext.update.call(configPeriodic, {
        ext: updatedExt,
        isPatch: true,
      })
        .then(updatedExtensionStatus => {
          expect(updatedExtensionStatus.status).to.eql('ok');
          return configPeriodic.datas.get('extension').load({ docid:'name' ,query: TEXT_ext.name, });
        })
        .then(updatedExtension => {
          // console.log({ updatedExtension });
          expect(updatedExtension._id).to.eql(TEXT_ext._id);
          expect(updatedExtension).to.be.ok;
          expect(updatedExtension.name).to.eql('periodicjs.ext.cloudupload');
          expect(updatedExtension.source).to.eql('npm');
          expect(updatedExtension.enabled).to.eql(false);
          expect(updatedExtension.description).to.eql('updated cloud upload extension');
          expect(updatedExtension._id).to.be.ok;
          done();
        })
        .catch(done);
    });
  });
  describe('remove', () => {
    it('should handle errors', () => {
      expect(CRUD_ext.remove()).to.eventually.be.rejected;
    });
    // it('should resolve to true if no db specified', () => {   
    //   expect(config.connectDB({ db:'other',  })).to.eventually.eql(true);
    // });
  });
  describe('list', () => {
    it('should handle errors', () => {
      expect(CRUD_ext.list()).to.eventually.be.rejected;
    });
    // it('should resolve to true if no db specified', () => {   
    //   expect(config.connectDB({ db:'other',  })).to.eventually.eql(true);
    // });
  });
  after('remove config test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});