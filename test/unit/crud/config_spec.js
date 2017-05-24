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
const CRUD_config = require('../../../lib/crud/config');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'crudCONFIGTest');
const initTestConfigJsonFile = path.join(initTestPathDir, 'content/config/config.json');
const configTestConfigJson = require('../../mock/config/config_test_config');
let configPeriodic;
const sample_configs_dir = path.resolve(__dirname, '../../mock/sample_configs');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
require('mocha-sinon');
let TEST_file_config;
let TEST_obj_config;

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
  describe('create', () => {
    it('should handle errors', (done) => {
      // expect(CRUD_config.create()).to.eventually.be.rejected;
      CRUD_config.create()
        .then(() => { 
          done(new Error('should have rejected'));
        })
        .catch(e => {
          expect(e).to.be.an('error');
          // console.log(e);
          done();
        });
    });
    it('should add config to config db from filepath', (done) => {
      const dummy_config_filepath = path.join(sample_configs_dir, 'dummy_config.json');
      CRUD_config.create.call(configPeriodic, dummy_config_filepath)
        .then(createdConfig => {
          TEST_file_config = createdConfig;
          expect(createdConfig).to.be.ok;
          expect(createdConfig.filepath).to.eql('content/config/appconfig/dummy.json');
          expect(createdConfig.environment).to.eql('test');
          expect(createdConfig.container).to.eql('default');
          expect(createdConfig._id).to.be.ok;

          return configPeriodic.datas.get('configuration').load({ query: createdConfig._id, });
        })
        .then(loadedExtension => {
          expect(loadedExtension._id).to.eql(TEST_file_config._id);
          done();
        })
        .catch(done);
    });
    it('should add config to config db from object', (done) => {
      CRUD_config.create.call(configPeriodic, {
        filepath:'content/config/appconfig/dummy2.json',
        environment:'test',
        container:'default',
        config:{
          'some':'data2',
          'test':true,
        },
      })
        .then(createdConfig => {
          TEST_obj_config = createdConfig;
          expect(createdConfig).to.be.ok;
          expect(createdConfig.filepath).to.eql('content/config/appconfig/dummy2.json');
          expect(createdConfig.environment).to.eql('test');
          expect(createdConfig.container).to.eql('default');
          expect(createdConfig._id).to.be.ok;

          return configPeriodic.datas.get('configuration').load({ query: createdConfig._id, });
        })
        .then(loadedExtension => {
          expect(loadedExtension._id).to.eql(TEST_obj_config._id);
          done();
        })
        .catch(done);
    });
  });
  describe('update', () => {
    it('should handle errors', (done) => {
      // expect(CRUD_config.create()).to.eventually.be.rejected;
      CRUD_config.update()
        .then(() => { 
          done(new Error('should have rejected'));
        })
        .catch(e => {
          expect(e).to.be.an('error');
          // console.log(e);
          done();
        });
    });
    it('should update config in config db', (done) => {   
      const updatedConf = Object.assign({}, TEST_file_config, {
        container: 'default-updated',
        config: {
          now: 'updated',
          works:true,
        },
      });
      // console.log({ updatedConf });
      CRUD_config.update.call(configPeriodic, {
        config: updatedConf,
      })
        .then(updatedConfigStatus => {
          expect(updatedConfigStatus.status).to.eql('ok');
          return configPeriodic.datas.get('configuration').load({ docid:'filepath', query: TEST_file_config.filepath, });
        })
        .then(updatedConfig => {
          // console.log({ updatedConfig });
          expect(updatedConfig._id).to.eql(TEST_file_config._id);
          expect(updatedConfig).to.be.ok;
          expect(updatedConfig.filepath).to.eql('content/config/appconfig/dummy.json');
          expect(updatedConfig.container).to.eql('default-updated');
          expect(updatedConfig.config).to.eql(updatedConf.config);
          expect(updatedConfig._id).to.be.ok;
          done();
        })
        .catch(done);
    });
  });
  describe('remove', () => {
    it('should handle errors', (done) => {
      // expect(CRUD_config.create()).to.eventually.be.rejected;
      CRUD_config.remove()
        .then(() => { 
          done(new Error('should have rejected'));
        })
        .catch(e => {
          expect(e).to.be.an('error');
          // console.log(e);
          done();
        });
    });
    it('should remove extension from extension db', (done) => {
      const server_config_filepath = path.join(sample_configs_dir, 'server_config.json');
      const display_config_filepath = path.join(sample_configs_dir, 'display_config.json');

      Promise.all([
        CRUD_config.create.call(configPeriodic, server_config_filepath),
        CRUD_config.create.call(configPeriodic, display_config_filepath),
      ])
        .then(() => {
          return configPeriodic.datas.get('configuration').query();
        })
        .then(confs => {
          expect(confs.length).to.eql(5);
          return CRUD_config.remove.call(configPeriodic, TEST_file_config._id);
        })
        .then(removedConf => {
          expect(removedConf.filepath).to.eql(TEST_file_config.filepath);
          return configPeriodic.datas.get('configuration').query();
        })
        .then(confs => {
          expect(confs.length).to.eql(4);
          // console.log({confs})
          return Promise.all([
            CRUD_config.remove.call(configPeriodic, { _id: confs[ 0 ]._id, }),
            CRUD_config.remove.call(configPeriodic, { filepath: confs[ 1 ].filepath, }),
          ]);
          // done();
        })
        .then(() => {
          return configPeriodic.datas.get('configuration').query();
        })
        .then(confs => {
          expect(confs.length).to.eql(2);
          done();
        })
        .catch(done);
    });
  });
  after('remove config test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});