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
const runtime = require('../../../lib/init/runtime');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'runtimeTest');
chai.use(require('sinon-chai'));
require('mocha-sinon');


describe('runtime', function () {
  this.timeout(10000);
  before('initialize test periodic dir', (done) => {
    fs.ensureDir(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
  describe('getEnv - Handles Command Line Arguments', () => {
    it('should return false if no valid command line arguments are present', () => {
      expect(runtime.getEnv()).to.be.false;
      expect(runtime.getEnv({ whatver:'ok'})).to.be.false;
    });
    it('should return environment from e property', () => {
      const env = 'development';
      expect(runtime.getEnv({e:env})).to.eql(env);
    });
    it('should return environment from first command line argument', () => {
      const argv = ['development'];
      const argv2 = ['only','if','one','argv'];
      expect(runtime.getEnv({_:argv})).to.eql(argv[0]);
      expect(runtime.getEnv({_:argv2})).to.be.false;
      expect(runtime.getEnv({_:[]})).to.be.false;
    });
    it('should read environment from env variables', () => {
      const processEnv = Object.assign({}, process.env);
      const nodeenv = 'nodetest';
      const env = 'test';
      process.env.NODE_ENV = nodeenv;
      expect(runtime.getEnv()).to.eql(nodeenv);
      delete process.env.NODE_ENV;
      process.env.ENV = env;
      expect(runtime.getEnv()).to.eql(env);
      delete process.env.ENV;
      process.env = processEnv;
    });
  });
  describe('setAppRunningEnv - updates application env', () => {
    const updateSpy = sinon.spy();
    const createSpy = sinon.spy();
    const testPeriodicInstance = {
      config: {},
      configuration: {
        update: updateSpy,
        create: createSpy,
      },
    };
    // const testSetAppRunningEnv = runtime.setAppRunningEnv.bind(testPeriodicInstance);
    it('should set running config environment', () => {
      expect(runtime.setAppRunningEnv.call(testPeriodicInstance, 'testenv')).to.be.false;
      expect(testPeriodicInstance.config.process.runtime).to.eql('testenv');
    });
    it('should update configuration db', () => { 
      expect(runtime.setAppRunningEnv.bind(testPeriodicInstance, 'testenv1', 'update')).to.be.a('function');
      runtime.setAppRunningEnv.call(testPeriodicInstance, 'testenv1', 'update');
      runtime.setAppRunningEnv.call(testPeriodicInstance, 'testenv1', 'create');
      expect(updateSpy.calledOnce).to.be.true;
      expect(createSpy.calledOnce).to.be.true;
    });
  });
  /*
	describe('Represents a singleton module', function () {
    it('should always reference the same instance of periodic when required', function () {
      let periodic2 = require('../../index');
      expect(periodic)
        .to.deep.equal(periodic2)
        .and.to.be.an.instanceof(periodicClass);
    });
  });
  describe('Manages initialization configuration', () => {
    // beforeEach(function() {
    //   // this.sinon.stub(console, 'log');
    // });
    it('should be implemented with configurable default settings', () => {
      expect(Object.keys(periodic.config).length).to.be.greaterThan(0);
    });
    it('should allow for overwriteable configs', (done) => {
      let spy = sinon.spy();
      periodic.logger.silly = spy;
      periodic.logger.debug = spy;
      periodic.logger.info = spy;
      periodic.logger.warn = spy;
      periodic.logger.error = spy;

      // this.sinon.stub(console, 'log');

      // console.log('this.sinon', this.sinon);
      periodic.init({
        debug: true,
        app_root: initTestPathDir,
      })
        .then((result) => {
          expect(periodic.config.debug).to.be.true;
          expect(periodic.config.app_root).to.eql(initTestPathDir);
          // console.log({ result, });
          done();
        })
        .catch(done);
    });
  });
  describe('Handles initialization errors', () => {
    it('handles console.timeEnd errors', (done) => {
      try {
        function foo() { throw new Error('Error On console.timeEnd'); }
        var fooSpy = sinon.stub(console, 'timeEnd', foo);
        let newPeriodic = new periodicClass({});
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
  */
  
  after('remove test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});