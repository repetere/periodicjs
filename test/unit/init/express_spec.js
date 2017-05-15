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
const folderStructure = require('../../../lib/init/folderStructure');
const initTestExpressPathDir = path.join(testPathDir, 'TestExpress');
const initTestExpressEndPathDir = path.join(testPathDir, 'TestExpressEnd');
const __STRUCTURE_DIR = path.resolve(__dirname, '../../../__STRUCTURE');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Init Express', function() {
  this.timeout(10000);
  before('initialize Express test periodic dir', (done) => {
    Promise.all([
        fs.ensureDir(initTestExpressPathDir),
        fs.ensureDir(initTestExpressEndPathDir),
        fs.copy(__STRUCTURE_DIR, initTestExpressPathDir)
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
    it('has configurable flash settings', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            use_flash: false,
            config: {
              trust_proxy: false,
            },
            body_parser: {
              urlencoded: {
                limit: '1mb',
                extended: true,
              },
              json: {
                limit: '1mb'
              },
            },
            cookies: {
              cookie_parser: 'defaultcookiejson',
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
          use: useSpy,
        },
      };
      express.configureExpress.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          // expect(enableSpy.called).to.not.be.true;
          // expect(engineSpy.calledThrice).to.be.true;
          // expect(mockThis.config.time_end).to.be.a('number');
          done();
        })
        .catch(done);
    });
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
    it('has configurable static caching', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              use_static_caching: false,
            },
            body_parser: {
              urlencoded: {
                limit: '1mb',
                extended: true,
              },
              json: {
                limit: '1mb'
              },
            },
          },
        },
        app: {
          use: useSpy,
        },
      };
      express.staticCacheExpress.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('can use disabled static caching settings', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              use_static_caching: true,
            },
            body_parser: {
              urlencoded: {
                limit: '1mb',
                extended: true,
              },
              json: {
                limit: '1mb'
              },
            },
          },
        },
        app: {
          use: useSpy,
        },
      };
      express.staticCacheExpress.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should handle errors', () => {
      expect(express.staticCacheExpress()).to.eventually.be.rejected;
    });
  });
  describe('compressExpress', () => {
    it('should handle errors', () => {
      expect(express.compressExpress()).to.eventually.be.rejected;
    });
    it('should use express compression', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              use_compression: true,
            },
          }
        },
        app: {
          use: useSpy,
        },
      };
      express.compressExpress.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should not use express compression', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              use_compression: false,
            },
          }
        },
        app: {
          use: useSpy,
        },
      };
      express.compressExpress.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.not.be.true;
          done();
        })
        .catch(done);
    });
  });
  describe('logExpress', () => {
    it('should handle errors', () => {
      expect(express.logExpress()).to.eventually.be.rejected;
    });
    it('should generate the right colored response', () => {
      function getColoredResponse(options) {
        const { color, status } = options;
        return '\x1b[' + color + 'm' + status + '\x1b[90m';
      }
      expect(express.morganColors({}, { statusCode: 501 })).to.eql(getColoredResponse({ color: 31, status: 501 }));
      expect(express.morganColors({}, { statusCode: 401 })).to.eql(getColoredResponse({ color: 33, status: 401 }));
      expect(express.morganColors({}, { statusCode: 301 })).to.eql(getColoredResponse({ color: 36, status: 301 }));
      expect(express.morganColors({}, { statusCode: 200 })).to.eql(getColoredResponse({ color: 32, status: 200 }));
    });
    it('should use express debugging', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              debug: true,
            },
          },
        },
        app: {
          use: useSpy,
        },
      };
      express.logExpress.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should not use express debugging', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        config: {
          app_root: initTestExpressPathDir,
        },
        settings: {
          express: {
            config: {
              debug: false,
            },
          }
        },
        app: {
          use: useSpy,
        },
      };
      express.logExpress.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.not.be.true;
          done();
        })
        .catch(done);
    });
  });
  describe('expressSessions', () => {
    it('should handle errors', () => {
      expect(express.expressSessions()).to.eventually.be.rejected;
    });
    it('should skip sessions', () => {
      expect(express.skipSessions({
        req: {
          headers: {
            authorization: true,
          },
        }
      })).to.be.true;
      expect(express.skipSessions({
        req: {
          headers: {},
          query: {
            skip_session: true,
          },
        }
      })).to.be.true;
      expect(express.skipSessions({
        req: {
          headers: {},
          controllerData: {
            skip_session: true,
          },
        }
      })).to.be.true;
      expect(express.skipSessions({
        req: {
          headers: {},
          query: {},
          controllerData: {},
        }
      })).to.be.false;
    });
    it('should skip session middleware', (done) => {
      const mockThis = {
        config: {},
        settings: {
          express: {
            sessions: {
              enabled: false,
            },
          },
        },
      };
      express.expressSessions.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should only support specific session stores', (done) => {
      const mockThis = {
        config: {},
        settings: {
          express: {
            sessions: {
              enabled: true,
              config: {
                secret: 'testsessions',
              },
            },
          },
        },
      };
      express.expressSessions.call(mockThis)
        .then(result => {
          done(new Error('Should be actually rejected'));
        })
        .catch(e => {
          expect(e.message).to.eql('Invalid express session type');
          done();
        });
    });
    it('should pass enabledSessionMiddleware', () => {
      const mockAuthReq = {
        headers: {
          authorization: true,
        },
      };
      const mockSessionReq = {
        headers: {},
        query: {},
        controllerData: {},
      };
      const mockRes = {};
      const sessionMiddlewareSpy = sinon.spy();
      const nextSpy = sinon.spy();
      express.enabledSessionMiddleware(sessionMiddlewareSpy, mockAuthReq, mockRes, nextSpy);
      expect(nextSpy.called).to.be.true;
      express.enabledSessionMiddleware(sessionMiddlewareSpy, mockSessionReq, mockRes, nextSpy);
      expect(sessionMiddlewareSpy.called).to.be.true;
    });
    it('should support loki session stores', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        app: {
          use: useSpy,
        },
        config: {},
        settings: {
          express: {
            sessions: {
              enabled: true,
              type: 'loki',
              config: {
                secret: 'sessiontest',
              },
            },
            config: {
              csrf: true,
            },
          },
        },
      };
      express.expressSessions.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should support mongo session stores', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        app: {
          use: useSpy,
        },
        config: {},
        settings: {
          express: {
            sessions: {
              enabled: true,
              type: 'mongo',
              config: {
                secret: 'sessiontest',
              },
              store_settings: {
                url: 'mongodb://localhost:27017/session_db',
              },
            },
            config: {
              csrf: true,
            },
          },
        },
      };
      express.expressSessions.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should support sql session stores', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        app: {
          use: useSpy,
        },
        config: {},
        settings: {
          express: {
            sessions: {
              enabled: true,
              type: 'sql',
              config: {
                secret: 'sessiontest',
              },
              store_settings: {
                db: [
                  "travis_ci_test", //database
                  "", //username
                  "", //password
                  {
                    "dialect": "postgres",
                    "port": 5432,
                    "host": "127.0.0.1",
                    logging: false,
                  }, //options
                ],
                options: {},
                modelName: 'session',
              },
            },
            config: {
              csrf: true,
            },
          },
        },
      };
      express.expressSessions.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
    it('should support redis session stores', (done) => {
      const useSpy = sinon.spy();
      const mockThis = {
        app: {
          use: useSpy,
        },
        config: {},
        settings: {
          express: {
            sessions: {
              enabled: true,
              type: 'redis',
              config: {
                secret: 'sessiontest',
              },
              store_settings: {
                // client An existing client
                host: 'localhost',
                port: 6379,
              },
            },
            config: {
              csrf: true,
            },
          },
        },
      };
      express.expressSessions.call(mockThis)
        .then(result => {
          expect(result).to.be.true;
          expect(useSpy.called).to.be.true;
          done();
        })
        .catch(done);
    });
  });
  describe('expressLocals', () => {
    it('should handle errors', () => {
      expect(express.expressLocals()).to.eventually.be.rejected;
    });
    it('useCSRFMiddleware handle CRSF', () => {
      const csrfSpy = sinon.spy();
      const mockReq = {
        csrfToken: csrfSpy,
      };
      const mockRes = {
        locals: {},
      };
      const nextSpy = sinon.spy();
      const mockCSRFThis = {
        settings: {
          express: {
            config: {
              csrf: true,
            },
          },
        },
      };
      const mockNoCSRFThis = {
        settings: {
          express: {
            config: {
              csrf: false,
            },
          },
        },
      };
      express.useCSRFMiddleware.call(mockCSRFThis, mockReq, mockRes, nextSpy);
      expect(csrfSpy.called).to.be.true;
      express.useCSRFMiddleware.call(mockNoCSRFThis, mockReq, mockRes, nextSpy);
      expect(nextSpy.called).to.be.true;
    });
    it('useLocalsMiddleware handle CRSF', () => {
      const mockReq = {
        headers: {},
        connection: {},
        user: {
          id: 1,
        },
      };
      const mockRes = {
        locals: {},
      };
      const nextSpy = sinon.spy();
      const mockThis = {
        app: {
          locals: {},
        },
      };
      express.useLocalsMiddleware.call(mockThis, mockReq, mockRes, nextSpy);
      expect(nextSpy.called).to.be.true;
      expect(mockThis.app.locals.isLoggedIn({})).to.eql(mockReq.user);
    });
  });
  describe('expressRouting', () => {
    it('should handle errors', () => {
      expect(express.expressRouting()).to.eventually.be.rejected;
    });
    it('should return a promise', () => {
      expect(express.expressRouting.call({ app: {} })).to.eventually.be.fulfilled;
    });
  });
  describe('expressStatus', () => {
    it('should handle errors', () => {
      expect(express.expressStatus()).to.eventually.be.rejected;
    });
  });
  describe('expressErrors', () => {
    it('should handle errors', () => {
      expect(express.expressErrors()).to.eventually.be.rejected;
    });
    it('catchAllErrorMiddleware should skip middleware if no errors', () => {
      const statusSpy = sinon.spy();
      const sendSpy = sinon.spy();
      const mockReq = {
        query: {
          format: 'json',
        },
        is: (type) => true,
      };
      const mockRes = {
        status: statusSpy,
        send: sendSpy,
      };
      const mockError = new Error('error for test');
      const nextSpy = sinon.spy();
      const statusSpy2 = sinon.spy();
      const renderSpy = sinon.spy();
      const mockReqAllError = {
        query: {},
        is: (type) => false,
      }
      const mockResAllError = {
        status: statusSpy2,
        render: renderSpy,
      };
      express.catchAllErrorMiddleware(mockError, mockReq, mockRes, nextSpy);
      expect(sendSpy.called).to.be.true;
      expect(statusSpy.called).to.be.true;
      express.catchAllErrorMiddleware.call({
        settings: {
          express: {
            views: {
              custom_error_view: 'someerrorview',
            },
          },
        },
      }, mockError, mockReqAllError, mockResAllError, nextSpy);
      expect(statusSpy2.called).to.be.true;
      expect(renderSpy.called).to.be.true;
    });
    it('catchAllErrorMiddleware should respond with errors', () => {
      const nextSpy = sinon.spy();
      express.catchAllErrorMiddleware(false, null, null, nextSpy);
      expect(nextSpy.called).to.be.true;
    });
    it('errorLogMiddleware should set error on next call', () => {
      const nextSpy = sinon.spy();
      const errorSpy = sinon.spy();
      const mockReq = {
        headers: {},
        connection: {},
      };
      const mockRes = {};
      const mockError = new Error('middleware error test');
      express.errorLogMiddleware.call({
        logger: {
          error: errorSpy,
        },
      }, mockError, mockReq, mockRes, nextSpy);
      expect(nextSpy.called).to.be.true;
      expect(errorSpy.called).to.be.true;
    });
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