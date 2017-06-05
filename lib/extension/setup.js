'use strict';
const Promisie = require('promisie');

function loadExtensionFiles() {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function loadExtensionSettings(options) {
  const { extension } = options;
  let defaultSettings = {};
  try {
    defaultSettings = require(`${extension.name}/config/settings.js`); // load default settings
  } catch (e) {
    this.logger.warn(`${extension.name} is missing default settings`, e.toString());
  }
  const envConfigFilePath = `content/config/extension/${extension.name}/${this.config.process.runtime}.json`; // load environment settings
  const overrideSettings = this.settings.extensions[`${extension.name}`]; // load override settings
  // assign to periodic.config.settings
  return new Promise((resolve, reject) => {
    try {
      this.configuration.load({
        docid: 'filepath',
        query: envConfigFilePath,
      }).then(envconfig => {
        const updatedSettings = Object.assign({}, defaultSettings.settings, envconfig, overrideSettings);
        console.log({ defaultSettings });
        // this.resources.databases.extensions.push(defaultSettings.databases);
        this.settings.extensions[extension.name] = updatedSettings;
        resolve(true);
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}
//       for (var [key, value] of myMap) {
//   console.log(key + ' = ' + value);
// }
function getExtensionFromMap(ext) {
  return { extension: ext };
}

function setupExtensions() {
  return new Promise((resolve, reject) => {
    try {
      const extensions = Array.from(this.extensions.values());
      const extensionSettings = loadExtensionSettings.bind(this);
      const extensionList = extensions.map(getExtensionFromMap);
      // console.log('initializing extension', this.extensions);
      //load all the files for extensions
      //load the configurations
      Promisie.each(extensionList, 5, extensionSettings)
        .then(result => {
          // this.logger.silly({ result });
          resolve(true);

        })
        .catch(reject);
      //set settings on this.settings.extensions
      //load the routers
      //load the controllers
      //load transforms
      // resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  setupExtensions,
};