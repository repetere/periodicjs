'use strict';
const Promisie = require('promisie');
const requestMethods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'POST'];

function loadExtensionFiles() {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function loadExtensionSettings(options) {
  const { extension, } = options;
  let defaultSettings = {};
  try {
    defaultSettings = require(`${extension.name}/config/settings.js`); // load default settings
  } catch (e) {
    if (this.config.debug) {
      this.logger.warn(`${extension.name} is missing default settings`, e.toString());
    }
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
        if (defaultSettings.databases) {
          Object.keys(defaultSettings.databases).forEach(db => {
            this.resources.databases.extensions[db] = defaultSettings.databases[db];
            this.resources.databases.extensions[db].extension = extension.name;
          });
        }
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
  return { extension: ext, };
}

function assignExtensionResources(options) {
  const { extension, } = options;
  return new Promise((resolve, reject) => {
    try {
      try {
        this.routers.set(`extension_${extension.name}`, {
          type: 'extension',
          router: require(`${extension.name}/routers/index`),
        });
      } catch (e) {
        if (this.config.debug) {
          this.logger.warn(`${extension.name} is missing a default router`, e.toString());
        }
      }
      try {
        this.controllers.extension.set(`${extension.name}`, require(`${extension.name}/controllers/index`));
      } catch (e) {
        if (this.config.debug) {
          this.logger.warn(`${extension.name} is missing a default controller`, e.toString());
        }
      }
      try {
        const transforms = require(`${extension.name}/transforms/index`);
        requestMethods.forEach(reqMethod => {
          if (transforms.pre) {
            this.transforms.pre[reqMethod] = Object.assign({}, this.transforms.pre[reqMethod], transforms.pre[reqMethod]);
          }
          if (transforms.post) {
            this.transforms.post[reqMethod] = Object.assign({}, this.transforms.post[reqMethod], transforms.post[reqMethod]);
          }
        });
      } catch (e) {
        // console.log('HAS NO TRANSFORMS')  
        // if (this.config.debug) {
        //   this.logger.warn(`${extension.name} is missing a default transforms`, e.toString());
        // }
      }
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function setupExtensions() {
  return new Promise((resolve, reject) => {
    try {
      const extensions = Array.from(this.extensions.values());
      const extensionSettings = loadExtensionSettings.bind(this);
      const extensionResources = assignExtensionResources.bind(this);
      const extensionList = extensions.map(getExtensionFromMap);
      //load all the files for extensions
      //load the configurations
      if (extensionList.length) {
        Promisie.each(extensionList, 5, extensionSettings)
          .then(result => {
            return Promisie.each(extensionList, 5, extensionResources);
          })
          .then(result => {
            resolve(result);
          })
          .catch(reject);
        //set settings on this.settings.extensions
        //load the routers
        //load the controllers
        //load transforms
        // resolve(true);
      } else {
        resolve('no-arrays');
      }
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  setupExtensions,
};