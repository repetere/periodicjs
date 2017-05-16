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
const server = require('../../../lib/init/server');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Init server', function() {
  this.timeout(10000);
  // describe('onlineEventHandler', () => {
  //   it('should log process id', () => {
  //     const infoSpy = sinon.spy();
  //     const mockThis = {
  //       logger: {
  //         info: infoSpy,
  //       },
  //     };
  //     const mockWorker = {
  //       process: {
  //         pid: 1,
  //       },
  //     };
  //     cluster.onlineEventHandler.call(mockThis, mockWorker);
  //     expect(infoSpy.called).to.be.true;
  //   });
  // });
  // describe('exitEventHandler', () => {
  //   it('should log process id', () => {
  //     const infoSpy = sinon.spy();
  //     const forkSpy = sinon.spy();
  //     const mockThis = {
  //       logger: {
  //         info: infoSpy,
  //       },
  //     };
  //     const mockCluster = {
  //       fork: forkSpy,
  //     };
  //     const mockWorker = {
  //       process: { pid: 1, },
  //     };
  //     const mockCode = {};
  //     const mockSignal = {};
  //     cluster.exitEventHandler.call(mockThis, mockCluster, mockWorker, mockCluster, mockSignal);
  //     expect(infoSpy.called).to.be.true;
  //     expect(forkSpy.called).to.be.true;
  //   });
  // });
  // describe('forkProcess', () => {
  //   it('should resolve true if not a clustered process', (done) => {
  //     const mockThis = {
  //       settings: {
  //         application: {
  //           cluster_process: false,
  //         },
  //       },
  //       config: {
  //         process: {},
  //       },
  //     };
  //     cluster.forkProcess.call(mockThis)
  //       .then(result => {
  //         expect(result).to.be.true;
  //         expect(mockThis.config.process.isClustered).to.be.false;
  //         done();
  //       })
  //       .catch(done);
  //   });
  //   it('should cluster master process', (done) => {
  //     const infoSpy = sinon.spy();
  //     const eventEmitterSpy = sinon.spy();
  //     const forkSpy = sinon.spy();
  //     const clusterObj = {
  //       isMaster: true,
  //       on: eventEmitterSpy,
  //       fork: forkSpy,
  //     };
  //     const mockThis = {
  //       settings: {
  //         application: {
  //           cluster_process: true,
  //         },
  //       },
  //       config: {
  //         process: {},
  //       },
  //       logger: {
  //         info: infoSpy,
  //       },
  //       cluster: clusterObj,
  //     };
  //     cluster.forkProcess.call(mockThis)
  //       .then(result => {
  //         done(new Error('FAILED cluster master test'));
  //       })
  //       .catch(e => {
  //         // expect(mockThis.config.process.isClustered).to.be.true;
  //         expect(infoSpy.called).to.be.true;
  //         expect(e.message).to.eql('Leave Promise Chain: Forking Process');
  //         done();
  //       });
  //   });
  //   it('should cluster fork process', (done) => {
  //     const infoSpy = sinon.spy();
  //     const eventEmitterSpy = sinon.spy();
  //     const forkSpy = sinon.spy();
  //     const clusterObj = {
  //       isMaster: false,
  //       on: eventEmitterSpy,
  //       fork: forkSpy,
  //     };
  //     const mockThis = {
  //       settings: {
  //         application: {
  //           cluster_process: true,
  //         },
  //       },
  //       config: {
  //         process: {},
  //       },
  //       logger: {
  //         info: infoSpy,
  //       },
  //       cluster: clusterObj,
  //     };
  //     cluster.forkProcess.call(mockThis)
  //       .then(result => {
  //         expect(mockThis.config.process.isClustered).to.be.true;
  //         expect(result).to.be.true;
  //         done();
  //       })
  //       .catch(done);
  //   });
  //   it('should handle errors', () => {
  //     expect(cluster.forkProcess()).to.eventually.be.rejected;
  //   });
  // });
  describe('startSocketIOserver', () => {
    it('should add socketio server', (done) => {
      const infoSpy = sinon.spy();
      const setSpy = sinon.spy();
      const mockThis = {
        logger: {
          info: infoSpy,
        },
        settings: {
          application: {
            server: {
              socketio: true,
            },
          },
        },
        servers: {
          set: setSpy,
        }
      };
      server.startSocketIOserver.call(mockThis)
        .then(result => {
          expect(setSpy.called).to.be.true;
          expect(result).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should handle errors', () => {
      expect(server.startSocketIOserver()).to.eventually.be.rejected;
    });
  });
  describe('startHTTPserver', () => {
    it('should add http server', (done) => {
      const verboseSpy = sinon.spy();
      const setSpy = sinon.spy();
      const mockThis = {
        logger: {
          verbose: verboseSpy,
        },
        settings: {
          application: {
            server: {
              http: {
                port: 8780,
              },
            },
          },
        },
        servers: {
          set: setSpy,
        },
        app: {
          listen: (port, e) => {
            e();
          },
        },
      };
      server.startHTTPserver.call(mockThis)
        .then(result => {
          expect(setSpy.called).to.be.true;
          expect(verboseSpy.called).to.be.true;
          expect(result).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should handle errors', () => {
      expect(server.startHTTPserver()).to.eventually.be.rejected;
    });
  });
  describe('startHTTPSserver', () => {
    it('should handle errors', () => {
      expect(server.startHTTPSserver()).to.eventually.be.rejected;
    });
  });
  describe('initializeServers', () => {
    it('should return a promise', () => {
      const infoSpy = sinon.spy();
      const mockThis = {
        logger: {
          info: infoSpy,
        },
        settings: {
          application: {
            server: {},
          },
        },
      };
      expect(server.initializeServers.call(mockThis)).to.be.a('promise');
    });
  });
});