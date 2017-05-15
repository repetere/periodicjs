'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
let periodic = require('../../index');
// let periodicSchema = require('../../lib/schema');
let periodicClass = require('../../lib/periodicClass');
chai.use(require('sinon-chai'));
require('mocha-sinon');
// const sinon = require('sinon');

const testPathDir = path.resolve(__dirname, '../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'initTest');
const initTestEVENTSPathDir = path.join(testPathDir, 'testEvents');
const initTest3PathDir = path.join(testPathDir, 'test3');

describe('Periodic', function() {
  this.timeout(10000);
  before('initialize test periodic dir', (done) => {
    Promise.all([
        fs.ensureDir(initTestPathDir),
        fs.ensureDir(initTestEVENTSPathDir),
        fs.ensureDir(initTest3PathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });
  describe('Singleton module', function() {
    it('should always reference the same instance of periodic when required', function() {
      let periodic2 = require('../../index');
      expect(periodic)
        .to.deep.equal(periodic2)
        .and.to.be.an.instanceof(periodicClass);
    });
  });
  describe('Initialization events', () => {
    it('emits initialization event', (done) => {
      let newPeriodic2 = new periodicClass({
        debug: false,
        environment: 'testevent',
        app_root: initTestEVENTSPathDir,
      });
      newPeriodic2.status.once('initializing', (state) => {
        expect(state).to.be.true;
        done();
      })
      newPeriodic2.init({
          debug: false,
          cli:true,
          app_root: initTestEVENTSPathDir,
        })
        .then((result) => {})
        .catch((e) => {
          done(e);
        });
    });
  });
  describe('Initialization configuration', () => {
    it('should be implemented with configurable default settings', () => {
      expect(Object.keys(periodic.config).length).to.be.greaterThan(0);
    });
    it('should allow for overwriteable configs', (done) => {
      let spy = sinon.spy();
      let overwriteableConfigPeriodic = new periodicClass({
        debug: false,
        environment: 'DISABLELOG',
        app_root: initTestEVENTSPathDir,
      });
      // process.env.ENV = 'test';
      // overwriteableConfigPeriodic.logger.silly = spy;
      // overwriteableConfigPeriodic.logger.debug = spy;
      // overwriteableConfigPeriodic.logger.info = spy;
      // overwriteableConfigPeriodic.logger.warn = spy;
      // overwriteableConfigPeriodic.logger.error = spy;
      overwriteableConfigPeriodic.init({
          debug: false,
          environment: 'DISABLELOG',
          cli:true,
          app_root: initTest3PathDir,
        })
        .then((result) => {
          expect(overwriteableConfigPeriodic.config.debug).to.be.false;
          expect(overwriteableConfigPeriodic.config.app_root).to.eql(initTest3PathDir);
          done();
        })
        .catch(done);
    });
  });
  after('remove test periodic dir', (done) => {
    Promise.all([
        fs.remove(initTestPathDir),
        fs.remove(initTestEVENTSPathDir),
        fs.remove(initTest3PathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });
});