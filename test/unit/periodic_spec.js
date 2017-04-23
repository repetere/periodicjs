'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const expect = require('chai').expect;
let lowkie = require('../../index');
let lowkieSchema = require('../../lib/schema');
let lowkieClass = require('../../lib/lowkieClass');

describe('Lowkie', function () {
	describe('Represents a singleton module', function () {
    it('should always reference the same instance of lowkie when required', function () {
      let lowkie2 = require('../../index');
      expect(lowkie)
        .to.deep.equal(lowkie2)
        .and.to.be.an.instanceof(lowkieClass);
    });
    it('should be implemented with configurable default settings', () => {
      expect(Object.keys(lowkie.config).length).to.be.greaterThan(0);
    });
    it('should export schema types', () => {
      expect(lowkie.Schema.Types).to.be.an('object');
      expect(lowkie.Schema.Types).to.have.property('String');
      expect(lowkie.Schema.Types.String).to.deep.equal(String);
      expect(lowkie.Schema.Types).to.have.property('ObjectId');
    });
    it('should have connection that emit events', () => {
      expect(lowkie.connection).to.be.an.instanceof(events.EventEmitter);
    });
    it('should expose a method for creating schemas', () => {
      let testUserSchema = {
        name: String,
        email: String,
        profile: {
          type: String,
          default: 'no profile',
        },
      };
      expect(lowkie.Schema).to.be.an.a('function');
      expect(lowkie.Schema(testUserSchema)).to.be.an.an('object');
    });
  });
});