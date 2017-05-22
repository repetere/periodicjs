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
const sequelizeExtensionSchema = require('../../../lib/schemas/extension.sequelize');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic lib defaults schema', function () {
  this.timeout(10000);
  const itemScheme = sequelizeSchema('item');
  const sampleJson = { data: 'test' };
  const stringifiedSampleJson = JSON.stringify(sampleJson);
  const setDataValueSpy = sinon.spy();
  const mockThis = {
    getDataValue: (val) => stringifiedSampleJson,
    setDataValue: setDataValueSpy,
  };
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
    it('should retrieve _attributes, contenttypeattributes, extensionattributes as json', () => {
      expect(itemScheme._attributes.get.call(mockThis)).to.eql(sampleJson)
      expect(itemScheme.contenttypeattributes.get.call(mockThis)).to.eql(sampleJson)
      expect(itemScheme.extensionattributes.get.call(mockThis)).to.eql(sampleJson)
    });
    it('should store _attributes, contenttypeattributes, extensionattributes as json', () => {
      itemScheme._attributes.set.call(mockThis, sampleJson);
      expect(setDataValueSpy.called).to.be.true;
      itemScheme.contenttypeattributes.set.call(mockThis,sampleJson)
      expect(setDataValueSpy.called).to.be.true;
      itemScheme.extensionattributes.set.call(mockThis,sampleJson)
      expect(setDataValueSpy.called).to.be.true;
    });
  });
  describe('sequelize extension schema', () => {
    it('should store periodic_config, periodic_dependencies, author, contributors and description', () => {
      const periodic_config_spy = sinon.spy();
      sequelizeExtensionSchema.options.setterMethods.periodic_config.call({ setDataValue: periodic_config_spy }, sampleJson);
      expect(periodic_config_spy.called).to.be.true;
      expect(periodic_config_spy.calledWith('periodic_config', JSON.stringify(sampleJson))).to.be.true;
      
      const periodic_dependencies_spy = sinon.spy();
      sequelizeExtensionSchema.options.setterMethods.periodic_dependencies.call({ setDataValue: periodic_dependencies_spy }, sampleJson);
      expect(periodic_dependencies_spy.called).to.be.true;
      expect(periodic_dependencies_spy.calledWith('periodic_dependencies', JSON.stringify(sampleJson))).to.be.true;
      
      const author_spy = sinon.spy();
      sequelizeExtensionSchema.options.setterMethods.author.call({ setDataValue: author_spy }, sampleJson);
      expect(author_spy.called).to.be.true;
      expect(author_spy.calledWith('author', JSON.stringify(sampleJson))).to.be.true;
      
      const contributors_spy = sinon.spy();
      sequelizeExtensionSchema.options.setterMethods.contributors.call({ setDataValue: contributors_spy }, sampleJson);
      expect(contributors_spy.called).to.be.true;
      expect(contributors_spy.calledWith('contributors', JSON.stringify(sampleJson))).to.be.true;
      
      const description_spy = sinon.spy();
      sequelizeExtensionSchema.options.setterMethods.description.call({ setDataValue: description_spy }, sampleJson);
      expect(description_spy.called).to.be.true;
      expect(description_spy.calledWith('description', JSON.stringify(sampleJson))).to.be.true;
    });
    it('should retrieve periodic_config, periodic_dependencies, author, contributors and description', () => {
      const mockThis = {
        getDataValue: () => stringifiedSampleJson,
      };
      expect(sequelizeExtensionSchema.options.getterMethods.periodic_config.call(mockThis)).to.eql(sampleJson);
      expect(sequelizeExtensionSchema.options.getterMethods.periodic_dependencies.call(mockThis)).to.eql(sampleJson);
      expect(sequelizeExtensionSchema.options.getterMethods.author.call(mockThis)).to.eql(sampleJson);
      expect(sequelizeExtensionSchema.options.getterMethods.contributors.call(mockThis)).to.eql(sampleJson);
      expect(sequelizeExtensionSchema.options.getterMethods.description.call(mockThis)).to.eql(sampleJson);
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