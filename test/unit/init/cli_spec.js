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
        // const crud_types = ['config', 'ext', 'con'];
        // const crud_ops = ['create', 'remove', 'update', 'get', 'list'];
        // const mockPeriodicThis = new periodicClass();
        // mockPeriodicThis.datas.set('configuration', {
        //   create: Promise.resolve(true),
        //   delete: Promise.resolve(true),
        //   update: Promise.resolve(true),
        //   search: Promise.resolve(true),
        // });
        // mockPeriodicThis.datas.set('extension', {
        //   create: Promise.resolve(true),
        //   delete: Promise.resolve(true),
        //   update: Promise.resolve(true),
        //   search: Promise.resolve(true),
        // });
        // crud_types.forEach(crud_type => {
        //   crud_ops.forEach(crud_op => {
        //     it(`should handle cli $ node index.js --cli --crud=${crud_type} --crud_op=${crud_op}`, () => {
        //       expect(cli.processArgv.call(mockPeriodicThis, {
        //         process: {
        //           exit: () => {},
        //         },
        //         argv: {
        //           crud: crud_type,
        //           crud_op,
        //           crud_arg: {},
        //         },
        //       })).to.be.a('promise');
        //     });
        //   });
        // });
    it('should output status', () => {
      const infoSpy = sinon.spy();
      const mockThis = {
        logger: {
          info: infoSpy,
          error: console.error,
        },
      };
      const mockOptions = {
        argv: {
          status: {},
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
      expect(infoSpy.called).to.be.true;
    });

    it('should run cli commands from extension', (done) => {
      const infoSpy = sinon.spy();
      const debugSpy = sinon.spy();      
      const processSpy = sinon.spy();      
      const mockThis = {
        resources: { 
          commands: {
            extensions: new Map(),
          },
        },
        logger: {
          info: infoSpy,
          debug: debugSpy,
          error: console.error,
        },
        config: {},
      };      
      mockThis.resources.commands.extensions.set('dbseed', {
        importData: (options) => {
          return new Promise((resolve, reject) => {
            done();
            resolve(true);
          });
        },
      });
      const mockOptions = {
        argv: {
          command: true,
          ext: true,
          name: 'dbseed',
          task: 'importData',
          args: {
            filepath: '/path/to/seedfile.json',
          },
        },
        process: {
          exit: () => {
            expect(infoSpy.called).to.be.true;
            expect(debugSpy.call).to.be.false;
            return;
          },
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
    });

    it('should run cli commands from extension -- debug', (done) => {
      const infoSpy = sinon.spy();
      const debugSpy = sinon.spy();      
      const processSpy = sinon.spy();      
      const mockThis = {
        resources: { 
          commands: {
            extensions: new Map(),
          },
        },
        logger: {
          info: infoSpy,
          debug: debugSpy,
          error: console.error,
        },
        config: {},
      };      
      mockThis.resources.commands.extensions.set('dbseed', {
        importData: (options) => {
          return new Promise((resolve, reject) => {
            done();
            resolve(true);
          });
        },
      });
      const mockOptions = {
        argv: {
          command: true,
          ext: true,
          name: 'dbseed',
          task: 'importData',
          crud_debug: true,
          args: {
            filepath: '/path/to/seedfile.json',
          },
        },
        process: {
          exit: () => {
            expect(debugSpy.called).to.be.true;
            return;
          },
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
    });

    it('should run cli commands from extension -- error', (done) => {
      const infoSpy = sinon.spy();
      const debugSpy = sinon.spy();      
      const errorSpy = sinon.spy(); 
      const exitSpy = sinon.spy();     
      const mockThis = {
        resources: { 
          commands: {
            extensions: new Map(),
          },
        },
        logger: {
          info: infoSpy,
          debug: debugSpy,
          error: errorSpy,
        },
        config: {},
      };      
      mockThis.resources.commands.extensions.set('dbseed', {
        importData: (options) => {
          return new Promise((resolve, reject) => {
            reject(new Error('testing the reject'));
          });
        },
      });
      const mockOptions = {
        argv: {
          command: true,
          ext: true,
          name: 'dbseed',
          task: 'importData',
          crud_debug: true,
          args: {
            filepath: '/path/to/seedfile.json',
          },
        },
        process: {
          exit: () => {
            expect(errorSpy.called).to.be.true;
            done();
          },
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
    });

    it('should handle a --crud command line arguments', (done) => {
      const infoSpy = sinon.spy();
      const debugSpy = sinon.spy();
      const mockThis = {
        crud: {
          config: {
            create: () => {
                            // console.log('calling crud', arguments)
              return new Promise((resolve, reject) => {
                                // console.log('in PROMISE')
                                // expect(infoSpy.called).to.be.true;
                  done();
                  resolve(true);
                });
            },
          },
        },
        logger: {
          info: infoSpy,
          debug: debugSpy,
          error: console.error,
        },
        config: {},
      };
      const mockOptions = {
        argv: {
          crud: 'config',
          crud_op: 'create',
          crud_arg: {},
        },
        process: {
          exit: () => {},
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
    });
    it('should handle a --crud command line arguments --debug', (done) => {
      const infoSpy = sinon.spy();
      const debugSpy = sinon.spy();
      const mockThis = {
        crud: {
          config: {
            create: () => {
                            // console.log('calling crud', arguments)
              return new Promise((resolve, reject) => {
                                // console.log('in PROMISE')
                                // expect(infoSpy.called).to.be.true;
                  done();
                  resolve(true);
                });
            },
          },
        },
        logger: {
          info: infoSpy,
          debug: debugSpy,
          error: console.error,
        },
        config: {},
      };
      const mockOptions = {
        argv: {
          crud: 'config',
          crud_op: 'create',
          crud_arg: {},
          crud_debug: true,
        },
        process: {
          exit: () => {},
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
    });
    it('should handle a --crud command line arguments errors', (done) => {
      const debugSpy = sinon.spy();
      const errorSpy = sinon.spy();
      const mockThis = {
        crud: {
          config: {
            create: () => {
                            // console.log('calling crud', arguments)
              return new Promise((resolve, reject) => {
                                // console.log('in PROMISE')
                                // expect(infoSpy.called).to.be.true;
                  reject(new Error('testing the reject'));
                });
            },
          },
        },
        logger: {
          debug: debugSpy,
          error: errorSpy,
        },
        config: {},
      };
      const mockOptions = {
        argv: {
          crud: 'config',
          crud_op: 'create',
          crud_arg: {},
          crud_debug: true,
        },
        process: {
          exit: () => {
            expect(errorSpy.called).to.be.true;
            done();
          },
        },
      };
      cli.processArgv.call(mockThis, mockOptions);
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
      }, 1000);
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
  describe('shortcutCrudArgs', () => {
    var testArgs = {
      some: 'args',
      un: 'modified',
    };
    it('should return unmodified crud args if not passed shortcut args', () => {
      expect(cli.shortcutCrudArgs(testArgs)).to.eql(testArgs);
    });
    it('should add create config crud arguments', () => {
      const createConfigArgs = Object.assign({}, testArgs, {
        addConfig: true,
        filepath: '/some/random/path',
      });
      const updatedArgs = cli.shortcutCrudArgs(createConfigArgs);
      expect(updatedArgs.crud).to.eql('config');
      expect(updatedArgs.crud_op).to.eql('create');
      expect(updatedArgs.crud_arg).to.eql(createConfigArgs.filepath);
    });
    it('should add remove config crud arguments', () => {
      const removeConfigArgs = Object.assign({}, testArgs, {
        removeConfig: true,
        id: '123457890',
      });
      const updatedArgs = cli.shortcutCrudArgs(removeConfigArgs);
      expect(updatedArgs.crud).to.eql('config');
      expect(updatedArgs.crud_op).to.eql('remove');
      expect(updatedArgs.crud_arg).to.eql(removeConfigArgs.id);
    });
    it('should add create ext crud arguments', () => {
      const createExtensionArgs = Object.assign({}, testArgs, {
        addExtension: true,
        name: 'some.extension',
      });
      const updatedArgs = cli.shortcutCrudArgs(createExtensionArgs);
      expect(updatedArgs.crud).to.eql('ext');
      expect(updatedArgs.crud_op).to.eql('create');
      expect(updatedArgs.crud_arg).to.eql(createExtensionArgs.name);
    });
    it('should add remove ext crud arguments', () => {
      const removeExtensionArgs = Object.assign({}, testArgs, {
        removeExtension: true,
        name: 'some.extension',
      });
      const updatedArgs = cli.shortcutCrudArgs(removeExtensionArgs);
      expect(updatedArgs.crud).to.eql('ext');
      expect(updatedArgs.crud_op).to.eql('remove');
      expect(updatedArgs.crud_arg).to.eql(removeExtensionArgs.name);
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
                });
    });
    it('should handle errors', () => {
      expect(cli.run()).to.eventually.be.rejected;
    });
  });
});