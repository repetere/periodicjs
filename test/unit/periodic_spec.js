'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const expect = require('chai').expect;
let periodic = require('../../index');
// let periodicSchema = require('../../lib/schema');
let periodicClass = require('../../lib/periodicClass');

describe('periodic', function () {
	describe('Represents a singleton module', function () {
    it('should always reference the same instance of periodic when required', function () {
      let periodic2 = require('../../index');
      expect(periodic)
        .to.deep.equal(periodic2)
        .and.to.be.an.instanceof(periodicClass);
    });
    it('should be implemented with configurable default settings', () => {
      expect(Object.keys(periodic.config).length).to.be.greaterThan(0);
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
});