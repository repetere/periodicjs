'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const fs = require('fs-extra');
const expect = require('chai').expect;
const periodic = require('../../../index');
const periodicClass = require('../../../lib/periodicClass');
const server = require('../../../lib/init/server');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Init server', function() {
  this.timeout(10000);
  describe('startSocketIOserver', () => {
    it('should add socketio server', (done) => {
      const infoSpy = sinon.spy();
      const errorSpy = sinon.spy();
      const setSpy = sinon.spy();
      const getSpy = sinon.spy();
      const mockThis = {
        logger: {
          info: infoSpy,
          error: errorSpy,
        },
        settings: {
          application: {
            server: {
              socketio: {
                type: true,
              },
            },
          },
        },
        servers: {
          set: setSpy,
          get: getSpy,
        },
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
                port: 8773,
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
    it('should handle http server creation error', (done) => {
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
                port: 8772,
              },
            },
          },
        },
        servers: {
          set: setSpy,
        },
        app: {
          listen: (port, e) => {
            e(new Error('test http server error'));
          },
        },
      };
      server.startHTTPserver.call(mockThis)
        .then(result => {
          done(new Error('failed to handle http server errors'));
        })
        .catch(e => {
          expect(e.message).to.eql('test http server error');
          done();
        });
    });
    it('should handle errors', () => {
      expect(server.startHTTPserver()).to.eventually.be.rejected;
    });
  });
  describe('startHTTPSserver', () => {
    it('should add https server', (done) => {
      const verboseSpy = sinon.spy();
      const setSpy = sinon.spy();
      const mockThis = {
        logger: {
          verbose: verboseSpy,
        },
        settings: {
          application: {
            server: {
              https: {
                port: 8770,
                ssl: {
                  pfx: path.resolve('lib/defaults/demo/certs/2017.testperiodic.ssl_key.pfx'),
                },
              },
            },
          },
        },
        servers: {
          set: setSpy,
        },
        app: express(),
      };
      server.startHTTPSserver.call(mockThis)
        .then(result => {
          expect(setSpy.called).to.be.true;
          expect(verboseSpy.called).to.be.true;
          expect(result).to.be.true;
          done();
        })
        .catch(done);
    });
    // it('should handle https server creation error', (done) => {
    //   const verboseSpy = sinon.spy();
    //   const errorSpy = sinon.spy();
    //   const setSpy = sinon.spy();
    //   const mockThis = {
    //     logger: {
    //       verbose: verboseSpy,
    //       error: errorSpy,
    //     },
    //     settings: {
    //       application: {
    //         server: {
    //           https: {
    //             port: 8771,
    //             ssl: {
    //               private_key: path.resolve('../../../lib/defaults/demo/certs/2017.testperiodic.ssl_key.pem'),
    //               certificate: path.resolve('../../../lib/defaults/demo/certs/2017.testperiodic.ssl_cert.pem'),
    //             },
    //           },
    //         },
    //       },
    //     },
    //     servers: {
    //       set: setSpy,
    //     },
    //     app: express(),
    //   };
    //   server.startHTTPSserver.call(mockThis)
    //     .then(result => {
    //       done(new Error('failed to handle http server errors'));
    //     })
    //     .catch(e => {
    //       expect(e.message).to.eql('tests http server error');
    //       done();
    //     });
    // });
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
        status: {
          emit:()=>{},
        },
      };
      expect(server.initializeServers.call(mockThis)).to.be.a('promise');
    });
  });
});