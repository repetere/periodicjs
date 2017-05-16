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
const cluster = require('../../../lib/init/cluster');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Util fetchUtils', function() {
  this.timeout(10000);

  describe('forkProcess', () => {
    it('should resolve true if not a clustered process', (done) => {
      const mockThis = {
        settings: {
          application: {
            cluster_process: false,
          },
        },
        config: {
          process: {},
        },
      };
      cluster.forkProcess.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(mockThis.config.process.isClustered).to.be.false;
          done();
        })
        .catch(done);
    });
    // it('should reject if a cli process', () => {
    //   const mockThis = {
    //     config: {
    //       cli: true,
    //       process: {},
    //     },
    //   };
    //   expect(cli.run.call(mockThis)).to.eventually.be.rejected;
    // });
    // it('should notify exit of promise chain', (done) => {
    //   const mockThis = {
    //     config: {
    //       cli: true,
    //       process: {},
    //     },
    //   };
    //   cli.run.call(mockThis)
    //     .then(result => {
    //       done(new Error('it should have rejected cli run'));
    //     })
    //     .catch(e => {
    //       expect(e.message).to.eql('Leave Promise Chain: CLI Process');
    //       done();
    //     })
    // });
    it('should handle errors', () => {
      expect(cluster.forkProcess()).to.eventually.be.rejected;
    });
  });
});