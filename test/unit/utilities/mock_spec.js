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
const mock = require('../../../lib/utilities/mock');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Util mock', function() {
  this.timeout(10000);
  describe('tempPromise', () => {
    it('should resolve as true', () => {
      expect(mock.tempPromise()).to.eventually.be.fulfilled;
    });
    it('should reject an errors', () => {
      expect(mock.tempPromise('throw')).to.eventually.be.rejected;
    });
    it('should return a promise', () => {
      expect(mock.tempPromise()).to.be.a('promise');
    });
  });
});