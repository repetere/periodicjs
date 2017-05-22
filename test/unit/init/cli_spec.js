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
const cli = require('../../../lib/init/cli');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Init cli', function() {
  this.timeout(10000);
  describe('processArgv', () => {
    it('should output status', () => {
      const infoSpy = sinon.spy();
      const mockThis = {
        logger: {
          info: infoSpy,
          error:console.error
        },
      };
      const mockOptions = {
        argv: {
          status:{},
        }
      }
      cli.processArgv.call(mockThis, mockOptions);
      expect(infoSpy.called).to.be.true;
    });
    it('should handle a --crud command line arguments', () => {
      const mockThis = new periodicClass();
      console.log({ mockThis });
      // const writeSpy = sinon.spy();
      // const mockThis = {
      //   logger: {
      //     // info: infoSpy,
      //   },
      // };
      // const mockOptions = {
      //   argv: {
      //     repl: true,
      //   },
      //   process: {
      //     stdout: {
      //       write: writeSpy,
      //     },
      //   },
      // };
      // cli.processArgv.call(mockThis, mockOptions);
      // setTimeout(() => {
      //   expect(writeSpy.called).to.be.true;
      //   done();
      // },1000)
    });
    it('should handle a --repl command line argument', (done) => {
      const writeSpy = sinon.spy();
      const mockThis = {
        logger: {
          // info: infoSpy,
        },
      };
      const mockOptions = {
        argv: {
          repl: true,
        },
        process: {
          stdout: {
            write: writeSpy,
          },
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
      setTimeout(() => {
        expect(writeSpy.called).to.be.true;
        done();
      },1000)
    });
    it('should handle errors status', () => {
      const errorSpy = sinon.spy();
      const exitSpy = sinon.spy();
      const mockThis = {
        logger: {
          error: errorSpy,
        },
      };
      const mockOptions = {
        process: {
          exit: exitSpy,
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
      expect(errorSpy.called).to.be.true;
      expect(exitSpy.called).to.be.true;
    });
  });
  describe('run', () => {
    it('should resolve true if not a cli process', () => {
      const mockThis = {
        config: {
          process: {},
        },
      };
      expect(cli.run.call(mockThis)).to.eventually.be.fulfilled;
    });
    it('should reject if a cli process', () => {
      const mockThis = {
        config: {
          cli: true,
          process: {},
        },
      };
      expect(cli.run.call(mockThis)).to.eventually.be.rejected;
    });
    it('should notify exit of promise chain', (done) => {
      const mockThis = {
        config: {
          cli: true,
          process: {},
        },
      };
      cli.run.call(mockThis)
        .then(result => {
          done(new Error('it should have rejected cli run'));
        })
        .catch(e => {
          expect(e.message).to.eql('Leave Promise Chain: CLI Process');
          done();
        })
    });
    it('should handle errors', () => {
      expect(cli.run()).to.eventually.be.rejected;
    });
  });
});