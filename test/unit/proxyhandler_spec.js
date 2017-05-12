'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const expect = require('chai').expect;
const sinon = require('sinon');
let periodicProxyHandler = require('../../lib/periodicProxyHandler');

describe('Periodic Class ProxyHandler', function () {
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
  it('should alias the configuraiton core data', () => {
    const testPeriodicInstance = {
      datas: new Map(),
    };
    const dummyConfigDBAdapter = {};
    testPeriodicInstance.datas.set('configuration', dummyConfigDBAdapter);
    expect(periodicProxyHandler().get(testPeriodicInstance, 'configuration')).to.eql(dummyConfigDBAdapter);
  });
  it('should alias the standard db', () => {
    const testPeriodicInstance = {
      dbs: new Map(),
    };
    const dummyConfigDBAdapter = {};
    testPeriodicInstance.dbs.set('standard', dummyConfigDBAdapter);
    expect(periodicProxyHandler().get(testPeriodicInstance, 'db')).to.eql(dummyConfigDBAdapter);
  });
  it('should alias the process runtime environment', () => {
    const testPeriodicInstance = {
      config: {
        process: {
          runtime:'testenv',
        },
      },
    };
    expect(periodicProxyHandler().get(testPeriodicInstance, 'environment')).to.eql('testenv');
  });
});