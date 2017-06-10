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
const install = require('../../../lib/extension/install');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Extension install', function() {
  this.timeout(10000);
  describe('installExtension', () => {
    it('should resolve as true', () => {
      expect(install.installExtension()).to.eventually.be.fulfilled;
    });
    it('should reject an errors', () => {
      expect(install.installExtension('throw')).to.eventually.be.rejected;
    });
    it('should return a promise', () => {
      expect(install.installExtension()).to.be.a('promise');
    });
  });
});