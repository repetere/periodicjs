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
const fetchUtils = require('../../../lib/utilities/fetchUtils');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Util fetchUtils', function() {
  this.timeout(10000);
  describe('generateErrorFromResponse', () => { 
    const testError = new Error('test error');
    it('should return error from data error response', () => {
      const errorData = {
        data: {
          error: 'error'
        },
      };
      expect(fetchUtils.generateErrorFromResponse({ res: errorData })).to.eql(errorData.data.error);
    });
    it('should return error from data response', () => {
      const errorData = {
        data: {
          someRado:'datum',
        },
      };
      expect(fetchUtils.generateErrorFromResponse({ res: errorData })).to.eql( JSON.stringify(errorData.data));
    });
    it('should return error if not formatted in response', () => {
      const testError = new Error('test error');
      const testErrorFormat = {
        status: 'error',
        notregularerror: {
          error: testError,
        },
      };
      expect(fetchUtils.generateErrorFromResponse({ res: testErrorFormat, error: testError })).to.eql(testError);
    });
  });
  describe('isVersionUpToDate', () => { 
    it('should return true if input version is greater than latest version', () => {
      expect(fetchUtils.isVersionUpToDate('10.0.0', '9.0.0')).to.be.true;
    });
    it('should return false if input version is not greater than latest version', () => {
      expect(fetchUtils.isVersionUpToDate('7.0.0', '9.0.0')).to.be.false;
    });
  });
  describe('checkStatus', () => {
    const jsonSpy = sinon.spy();
    const okResponse = {
      status: 200,
    };
    const failedResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      json: jsonSpy,
    };
    it('should handle errors', () => {
      expect(fetchUtils.checkStatus()).to.eventually.be.rejected;
    });
    it('should handle successful responses', () => {
      expect(fetchUtils.checkStatus(okResponse)).to.eventually.be.fulfilled;
    });
    it('should reject with normal error test', () => { 
      expect(fetchUtils.checkStatus(failedResponse)).to.eventually.be.rejected;
    });
  });
  describe('generateErrorResponse', () => {
    it('should return a formatted error', () => {
      const testError = new Error('test error');
      const testErrorFormat = {
        status: 'error',
        data: {
          error: testError,
        },
      };
      expect(fetchUtils.generateErrorResponse(testError)).to.eql(testErrorFormat);
    });
    // it('stores intialization end time', (done) => {
    //   const infoSpy = sinon.spy();
    //   const mockThis = {
    //     config: {},
    //     logger: {
    //       info: infoSpy,
    //     },
    //   };
    //   consoleTimer.endTimer.call(mockThis)
    //     .then(result => {
    //       expect(result).to.be.true;
    //       expect(infoSpy.called).to.be.true;
    //       expect(mockThis.config.time_end).to.be.a('number');
    //       done();
    //     })
    //     .catch(done);
    // });
    // it('should handle errors', () => {
    //   expect(consoleTimer.startTimer()).to.eventually.be.rejected;
    //   expect(consoleTimer.endTimer()).to.eventually.be.rejected;
    // });
  });
});