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
const consoleTimer = require('../../../lib/init/consoleTimer');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestConsoleTimePathDir = path.join(testPathDir, 'testConsoleTime');
const initTestConsoleTimeEndPathDir = path.join(testPathDir, 'testConsoleTimeEnd');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Init Console Timer', function() {
  this.timeout(10000);
  before('initialize console test periodic dir', (done) => {
    Promise.all([
        fs.ensureDir(initTestConsoleTimePathDir),
        fs.ensureDir(initTestConsoleTimeEndPathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });
  describe('Initialization errors', () => {
    it('stores intialization start time', (done) => {
      const mockThis = {
        config: {},
      };
      consoleTimer.startTimer.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(mockThis.config.time_start).to.be.a('number');
          done();
        })
        .catch(done);
    });
    it('stores intialization end time', (done) => {
      const infoSpy = sinon.spy();
      const mockThis = {
        config: {},
        logger: {
          info: infoSpy,
        },
      };
      consoleTimer.endTimer.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(infoSpy.called).to.be.true;
          expect(mockThis.config.time_end).to.be.a('number');
          done();
        })
        .catch(done);
    });
    it('should handle errors', () => {
      expect(consoleTimer.startTimer()).to.eventually.be.rejected;
      expect(consoleTimer.endTimer()).to.eventually.be.rejected;
    });
    // it('handles console.timeEnd errors', (done) => {
    //   try {
    //     function foo() { throw new Error('Error On console.timeEnd'); }
    //     var fooSpy = sinon.stub(console, 'timeEnd', foo);
    //     let newPeriodic = new periodicClass({});
    //     // process.env.ENV = 'test';
    //     console.time = sinon.stub(console, 'time');
    //     console.timeEnd = fooSpy;
    //     newPeriodic.init({
    //         debug: false,
    //         environment: 'DISABLELOG',
    //         app_root: initTestConsoleTimeEndPathDir,
    //       }).then((m) => {
    //         console.time.restore();
    //         console.timeEnd.restore();
    //         done(new Error('was not supposed to succeed'));
    //       })
    //       .catch((m) => {
    //         expect(fooSpy.threw()).to.be.ok;
    //         console.time.restore();
    //         console.timeEnd.restore();
    //         done();
    //       });
    //   } catch (e) {
    //     console.time.restore();
    //     console.timeEnd.restore();
    //     console.log({ e });
    //     done();
    //   }
    // });
    // it('handles console.time errors', (done) => {
    //   try {
    //     function foo() { throw new Error('Error On console.time'); }
    //     var fooSpy = sinon.stub(console, 'time', foo);
    //     let newPeriodic = new periodicClass({});
    //     // process.env.ENV = 'test';
    //     console.time = fooSpy;
    //     console.timeEnd = sinon.stub(console, 'timeEnd');
    //     newPeriodic.init({
    //         debug: false,
    //         environment: 'DISABLELOG',
    //         app_root: initTestConsoleTimePathDir,
    //       }).then((m) => {
    //         console.time.restore();
    //         console.timeEnd.restore();
    //         done(new Error('was not supposed to succeed'));
    //       })
    //       .catch((m) => {
    //         expect(fooSpy.threw()).to.be.ok;
    //         console.timeEnd.restore();
    //         console.time.restore();
    //         done();
    //       });
    //   } catch (e) {
    //     console.time.restore();
    //     console.timeEnd.restore();
    //     console.log({ e });
    //     done();
    //   }
    // });
  });
  after('remove console test periodic dir', (done) => {
    Promise.all([
        fs.remove(initTestConsoleTimePathDir),
        fs.remove(initTestConsoleTimeEndPathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });
});