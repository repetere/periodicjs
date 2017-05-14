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
const express = require('../../../lib/init/express');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestExpressPathDir = path.join(testPathDir, 'TestExpress');
const initTestExpressEndPathDir = path.join(testPathDir, 'TestExpressEnd');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Init Express', function() {
  this.timeout(10000);
  before('initialize Express test periodic dir', (done) => {
    Promise.all([
        fs.ensureDir(initTestExpressPathDir),
        fs.ensureDir(initTestExpressEndPathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });
  describe('configureViews', () => {
    it('should handle errors', () => {
      expect(express.configureViews()).to.eventually.be.rejected;
    });
    it('sets express non ejs view with proxy options', (done) => {
      const setSpy = sinon.spy();
      const enableSpy = sinon.spy();
      const engineSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              trust_proxy: true,
            },
            views: {
              engine: 'jsx',
              lru_cache: true,
              lru: 100,
              package: 'ejs',
            }
          }
        },
        app: {
          set: setSpy,
          enable: enableSpy,
          engine: engineSpy,
          // set: setSpy,
        },
      };
      express.configureViews.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(setSpy.calledTwice).to.be.true;
          expect(enableSpy.calledOnce).to.be.true;
          expect(engineSpy.calledThrice).to.be.true;
          // expect(mockThis.config.time_end).to.be.a('number');
          done();
        })
        .catch(done);
    });
    it('sets express ejs view without proxy options', (done) => {
      const setSpy = sinon.spy();
      const enableSpy = sinon.spy();
      const engineSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              trust_proxy: false,
            },
            views: {
              // engine: 'ejs',
              lru_cache: false,
              lru: 100,
              package: 'ejs',
            }
          }
        },
        app: {
          set: setSpy,
          enable: enableSpy,
          engine: engineSpy,
          // set: setSpy,
        },
      };
      express.configureViews.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(setSpy.calledTwice).to.be.true;
          expect(enableSpy.called).to.not.be.true;
          expect(engineSpy.calledThrice).to.be.true;
          // expect(mockThis.config.time_end).to.be.a('number');
          done();
        })
        .catch(done);
    });
  });
  describe('configureExpress', () => {
    it('should handle errors', () => {
      expect(express.configureExpress()).to.eventually.be.rejected;
    });
  });
  describe('customizeExpress', () => {
    it('should handle errors', () => {
      expect(express.customizeExpress()).to.eventually.be.rejected;
    });
  });
  describe('staticCacheExpress', () => {
    it('should handle errors', () => {
      expect(express.staticCacheExpress()).to.eventually.be.rejected;
    });
  });
  describe('compressExpress', () => {
    it('should handle errors', () => {
      expect(express.compressExpress()).to.eventually.be.rejected;
    });
  });
  describe('logExpress', () => {
    it('should handle errors', () => {
      expect(express.logExpress()).to.eventually.be.rejected;
    });
  });
  // describe('expressSessions', () => {
  //   it('should handle errors', () => {
  //     expect(express.expressSessions()).to.eventually.be.rejected;
  //   });
  // });
  // describe('expressLocals', () => {
  //   it('should handle errors', () => {
  //     expect(express.expressLocals()).to.eventually.be.rejected;
  //   });
  // });
  // describe('expressRouting', () => {
  //   it('should handle errors', () => {
  //     expect(express.expressRouting()).to.eventually.be.rejected;
  //   });
  // });
  // describe('expressStatus', () => {
  //   it('should handle errors', () => {
  //     expect(express.expressStatus()).to.eventually.be.rejected;
  //   });
  // });
  // describe('expressErrors', () => {
  //   it('should handle errors', () => {
  //     expect(express.expressErrors()).to.eventually.be.rejected;
  //   });
  // });
  describe('Error handling', () => {
    // it('stores intialization start time', (done) => {
    //   const mockThis = {
    //     config: {},
    //   };
    //   express.startTimer.call(mockThis)
    //     .then(result => {
    //       expect(result).to.be.true;
    //       expect(mockThis.config.time_start).to.be.a('number');
    //       done();
    //     })
    //     .catch(done);
    // });

  });
  after('remove Express test periodic dir', (done) => {
    Promise.all([
        fs.remove(initTestExpressPathDir),
        fs.remove(initTestExpressEndPathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });
});