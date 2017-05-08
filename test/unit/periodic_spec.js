'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
let periodic = require('../../index');
// let periodicSchema = require('../../lib/schema');
let periodicClass = require('../../lib/periodicClass');
chai.use(require('sinon-chai'));
require('mocha-sinon');
// const sinon = require('sinon');

const testPathDir = path.resolve(__dirname, '../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'initTest');


describe('periodic', function () {
  this.timeout(10000);
  before('initialize test periodic dir', (done) => {
    fs.ensureDir(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
	describe('Represents a singleton module', function () {
    it('should always reference the same instance of periodic when required', function () {
      let periodic2 = require('../../index');
      expect(periodic)
        .to.deep.equal(periodic2)
        .and.to.be.an.instanceof(periodicClass);
    });
  
    // it('should export schema types', () => {
    //   expect(periodic.Schema.Types).to.be.an('object');
    //   expect(periodic.Schema.Types).to.have.property('String');
    //   expect(periodic.Schema.Types.String).to.deep.equal(String);
    //   expect(periodic.Schema.Types).to.have.property('ObjectId');
    // });
    // it('should have connection that emit events', () => {
    //   expect(periodic.connection).to.be.an.instanceof(events.EventEmitter);
    // });
    // it('should expose a method for creating schemas', () => {
    //   let testUserSchema = {
    //     name: String,
    //     email: String,
    //     profile: {
    //       type: String,
    //       default: 'no profile',
    //     },
    //   };
    //   expect(periodic.Schema).to.be.an.a('function');
    //   expect(periodic.Schema(testUserSchema)).to.be.an.an('object');
    // });
  });
  describe('Manages initialization configuration', () => {
    // beforeEach(function() {
    //   // this.sinon.stub(console, 'log');
    // });
    it('should be implemented with configurable default settings', () => {
      expect(Object.keys(periodic.config).length).to.be.greaterThan(0);
    });
    it('should allow for overwriteable configs', (done) => {
      let spy = sinon.spy();
      periodic.logger.silly = spy;
      periodic.logger.debug = spy;
      periodic.logger.info = spy;
      periodic.logger.warn = spy;
      periodic.logger.error = spy;

      // this.sinon.stub(console, 'log');

      // console.log('this.sinon', this.sinon);
      periodic.init({
        debug: true,
        app_root: initTestPathDir,
      })
      .then((result) => {
        expect(periodic.config.debug).to.be.true;
        expect(periodic.config.app_root).to.eql(initTestPathDir);
        // console.log({ result, });
        done();
      })
      .catch(done);
    });
  })
  after('remove test periodic dir', (done) => {
    fs.remove(initTestPathDir)
      .then(() => {
        done();
      }).catch(done);
  });
});