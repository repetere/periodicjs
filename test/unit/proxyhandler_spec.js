'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const expect = require('chai').expect;
const sinon = require('sinon');
let periodicProxyHandler = require('../../lib/periodicProxyHandler');

describe('ProxyHandler', function () {
  it('should be a proxy handler', () => {
    expect(periodicProxyHandler).to.be.a('function');    
  });
  it('should return a proxy handler object', () => {
    expect(periodicProxyHandler()).to.be.a('object');
  });
  it('should trap get property access', () => {
    let spy = sinon.spy();
    let testProxy = new Proxy(spy, periodicProxyHandler);
    testProxy.someprop = '1234';
    testProxy.someprop = testProxy.someprop.toString();
    expect(periodicProxyHandler().get).to.be.a('function');
    expect(testProxy.someprop).to.eql(spy.someprop);
    expect(periodicProxyHandler().get(spy, 'someprop')).to.eql(spy.someprop);
  });
});