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
const logger = require('../../../lib/init/logger');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'loggerTest');
chai.use(require('sinon-chai'));
require('mocha-sinon');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));


describe('Periodic Init logger', function() {
  this.timeout(10000);
  before('initialize logger test periodic dir', (done) => {
    fs.ensureDir(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
  describe('configureLogger', () => {
    it('should use default console log', (done) => {
      const mockThis = {
        environment: 'test',
        settings: {
          logger: {
            use_winston_logger: false,
          }
        },
        logger: console,
      };
      logger.configureLogger.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(mockThis.logger).to.eql(console);
          done();
        })
        .catch(done);
    });
    it('should use standard winston logger', (done) => {
      const winstonSpy = sinon.spy();
      const mockThis = {
        environment: 'test',
        config: {
          app_root: initTestPathDir,
        },
        settings: {
          logger: {
            use_winston_logger: true,
            use_standard_logging: true,
          }
        },
        logger: console,
      };
      logger.configureLogger.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          // expect(winstonSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should handle errors', () => {
      expect(logger.configureLogger()).to.eventually.be.rejected;
    });
  });

  describe('catchProcessErrors', () => {
    it('should catch errors', () => {
      expect(logger.catchProcessErrors.call({ logger: { error: () => {} } })).to.eventually.be.fulfilled;
    });
    it('should handle errors', (done) => {
      logger.catchProcessErrors.call()
        .then((result) => {
          done(new Error('this should never be called'));
        })
        .catch(e => {
          expect(e).to.be.an('error');
          done();
        });
    });
    // it('should handle errors', () => {
    //   // process = sinon.stub(process);
    //   expect(logger.catchProcessErrors.call()).to.eventually.be.rejected;

    // });
    // it('should catch uncaught exceptions', (done) => {
    //   const errorSpy = sinon.spy();
    //   const processEventEmitter = new events.EventEmitter();
    //   const originalProcess = Object({}, process);
    //   process = processEventEmitter;
    //   const mockThis = {
    //     logger: {
    //       error: errorSpy,
    //     }
    //   }
    //   logger.catchProcessErrors.call(mockThis)
    //     .then(() => {

    //       process.emit('uncaughtException');
    //       setImmediate(() => {
    //         expect(errorSpy.called).to.be.true;
    //         process = originalProcess;
    //       })
    //     })
    //     .catch(done);
    // });
  });


  after('remove logger test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});