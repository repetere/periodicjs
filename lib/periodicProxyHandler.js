'use strict';

/**
 * @function handler
 * @description this is the proxy handler for periodic, provides access to native expess methods as well.
 * 
 * @returns {object}
 */
function proxyHandler() {
  //bound this;
  return {
    get: function(target, name) {
      if (name === 'configuration') {
        return target.datas.get('configuration');
      } else if (name === 'db') {
        return target.dbs.get('standard');
      } else {
        // console.log({ name });
        return target[name];
      }
    },
  };
}

module.exports = proxyHandler;