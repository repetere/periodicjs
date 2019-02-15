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
    get: function (target, name) {
      if (name === 'configuration') {
        return target.datas.get('configuration');
      } else if (name === 'db') {
        return target.dbs.get('standard');
      } else if (name === 'environment') {
        return target.config.process.runtime;
      } else if (name === 'container') {
        return target.settings.container;
      } else if (name === 'theme') {
        return target.settings.container.name;
      } else if (name === '_settings_container') {
        const containerName = target.settings.container.name;
        return target.settings.container[containerName];
      } else if (name.includes('_settings_extension')) {
        const [,,, extensionName, ] = name.split('_');
        return target.settings.extensions[extensionName];
      } else {
        return target[name];
      }
    },
  };
}

module.exports = proxyHandler;