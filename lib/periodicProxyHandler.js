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
      } else if (name && typeof name ==='string' && name.includes('_settings_extension')) {
        const extensionName = name.replace('_settings_extensions_', '');
        return target.settings.extensions[extensionName];
      } else if (name && typeof name ==='string' && name.includes('_utilities_')) { //_utilities_extensions_periodicjs.ext.dblogger
        const [ spacer, utilities, type, ] = name.split('_');
        const property = name.replace(`_utilities_${type}_`, '');
        return target.locals[type].get(property);
      } else if (name && typeof name ==='string' && name.includes('_controllers_')) { //_controllers_extensions_periodicjs.ext.dblogger
        const [ spacer, controller, type, ] = name.split('_');
        const contollerProp = (type === 'extensions')
          ? 'extension'
          : (type === 'containers')
            ? 'container'
            : type;
        const property = name.replace(`_controllers_${type}_`, '');
        return target.controllers[contollerProp].get(property);
      } else {
        return target[name];
      }
    },
  };
}

module.exports = proxyHandler;