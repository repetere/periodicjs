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
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
require('mocha-sinon');

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
    it('should handle errors', () => {
      expect(CRUD_config.create()).to.eventually.be.rejected;
    });
    // it('should resolve to true if no db specified', () => {   
    //   expect(config.connectDB({ db:'other',  })).to.eventually.eql(true);
    // });
  });
  describe('remove', () => {
    it('should handle errors', () => {
      expect(CRUD_config.remove()).to.eventually.be.rejected;
    });
    // it('should resolve to true if no db specified', () => {   
    //   expect(config.connectDB({ db:'other',  })).to.eventually.eql(true);
    // });
  });
  describe('update', () => {
    it('should handle errors', () => {
      expect(CRUD_config.update()).to.eventually.be.rejected;
    });
    // it('should resolve to true if no db specified', () => {   
    //   expect(config.connectDB({ db:'other',  })).to.eventually.eql(true);
    // });
  });
  // describe('list', () => {
  //   it('should handle errors', () => {
  //     expect(CRUD_config.list()).to.eventually.be.rejected;
  //   });
  //   // it('should resolve to true if no db specified', () => {   
  //   //   expect(config.connectDB({ db:'other',  })).to.eventually.eql(true);
  //   // });
  // });
  after('remove config test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});