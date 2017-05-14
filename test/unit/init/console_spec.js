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