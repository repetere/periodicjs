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
const initTest2PathDir = path.join(testPathDir, 'test2');
// const initTest3PathDir = path.join(testPathDir, 'test3');

describe('Periodic', function () {
  this.timeout(10000);
  before('initialize test periodic dir', (done) => {
    fs.ensureDir(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
	describe('Singleton module', function () {
    it('should always reference the same instance of periodic when required', function () {
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
        app_root: initTest2PathDir,
      });
      newPeriodic2.status.once('initializing', (state) => { 
        expect(state).to.be.true;
        done();
      })
      newPeriodic2.init({
        debug: false,
        app_root: initTest2PathDir,
      })
        .then((result) => { 
        })
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
      process.env.ENV = 'test';
      periodic.logger.silly = spy;
      periodic.logger.debug = spy;
      periodic.logger.info = spy;
      periodic.logger.warn = spy;
      periodic.logger.error = spy;
      periodic.init({
        debug: true,
        app_root: initTestPathDir,
      })
        .then((result) => {
          expect(periodic.config.debug).to.be.true;
          expect(periodic.config.app_root).to.eql(initTestPathDir);
          done();
        })
        .catch(done);
    });
  });
  describe('Initialization errors', () => {
    it('handles console.timeEnd errors', (done) => {
      try {
        function foo() { throw new Error('Error On console.timeEnd'); }
        var fooSpy = sinon.stub(console, 'timeEnd', foo);
        let newPeriodic = new periodicClass({});
        process.env.ENV = 'test';
        console.timeEnd = fooSpy;
        newPeriodic.init({
          debug: false,
          app_root: initTestPathDir,
        }).then((m) => {
          console.timeEnd.restore();
          done(new Error('was not supposed to succeed'));
        })
          .catch((m) => {
            expect(fooSpy.threw()).to.be.ok;
            console.timeEnd.restore();
            done();
          });
      } catch (e) {
        console.timeEnd.restore();
        console.log({ e });
        done();
      }
    })
    it('handles console.time errors', (done) => {
      try {
        function foo() { throw new Error('Error On console.timeEnd'); }
        var fooSpy = sinon.stub(console, 'timeEnd', foo);
        let newPeriodic = new periodicClass({});
        process.env.ENV = 'test';
        console.time = fooSpy;
        newPeriodic.init({
          debug: false,
          app_root: initTestPathDir,
        }).then((m) => {
          console.time.restore();
          done(new Error('was not supposed to succeed'));
        })
          .catch((m) => {
            expect(fooSpy.threw()).to.be.ok;
            console.time.restore();
            done();
          });
      } catch (e) {
        console.time.restore();
        console.log({ e });
        done();
      }
    })
  });
  
  after('remove test periodic dir', (done) => {
    Promise.all([
      fs.remove(initTestPathDir),
      fs.remove(initTest2PathDir),
    ])
      .then(() => {
        done();
      }).catch(done);
  });
});