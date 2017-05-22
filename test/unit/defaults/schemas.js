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
const lowkieSchema = require('../../../lib/defaults/schema/lowkie.schema');
const mongooseSchema = require('../../../lib/defaults/schema/mongoose.schema');
const sequelizeSchema = require('../../../lib/defaults/schema/sequelize.schema');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic lib defaults schema', function() {
  this.timeout(10000);
  describe('mongoose', () => { 
    it('should return model scheme', () => {
      expect(mongooseSchema('example')).to.be.an('object');
    });
    it('should set entity type', () => {
      expect(mongooseSchema('item').entitytype.default).to.eql('item');
    });
  });
  describe('sequelize', () => { 
    it('should return model scheme', () => {
      expect(sequelizeSchema('example')).to.be.an('object');
    });
    it('should set entity type', () => {
      expect(sequelizeSchema('item').entitytype.default).to.eql('item');
    });
  });
  describe('lowkie', () => { 
    it('should return model scheme', () => {
      expect(lowkieSchema('example')).to.be.an('object');
    });
    it('should set entity type', () => {
      expect(lowkieSchema('item').entitytype.default).to.eql('item');
    });
  });
});