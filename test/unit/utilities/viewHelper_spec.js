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
const viewHelper = require('../../../lib/utilities/viewHelper');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Util viewHelper', function() {
  this.timeout(10000);
  describe('passObjToClient', () => {
    it('should return a string of an object for window', () => {
      const backedObject = { some: 'data' };
      const windowVar = 'testdata';
      expect(viewHelper.passObjToClient(backedObject, windowVar)).to.eql(`var ${windowVar} = ${(JSON.stringify(backedObject))}`);
    });
  });
});