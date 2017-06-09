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
const uninstall = require('../../../lib/extension/uninstall');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Extension uninstall', function() {
  this.timeout(10000);
  describe('uninstallExtension', () => {
    it('should resolve as true', () => {
      expect(uninstall.uninstallExtension()).to.eventually.be.fulfilled;
    });
    it('should reject an errors', () => {
      expect(uninstall.uninstallExtension('throw')).to.eventually.be.rejected;
    });
    it('should return a promise', () => {
      expect(uninstall.uninstallExtension()).to.be.a('promise');
    });
  });
});