'use strict';
const Promisie = require('promisie');
const fs = require('fs-extra');
const requestMethods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'POST'];
const path = require('path');
const flatten = require('flat');

function getModelFilesMap(dir, modelfile) {
  return path.join(dir, modelfile, '___FULLPATH___');
}

function loadExtensionFiles(options) {
  const { extension = {}, container = {}, } = options;
  return new Promise((resolve, reject) => {
    try {
      const standardModelsDir = (container.name) ?
        (container.type === 'local') ?
        `${this.config.app_root}/content/container/${container.name}/config/databases/standard/models` :
        `${this.config.app_root}/node_modules/${container.name}/config/databases/standard/models` :
        `${this.config.app_root}/node_modules/${extension.name}/config/databases/standard/models`;
      const modelFilesMap = getModelFilesMap.bind(standardModelsDir);
      fs.readdir(standardModelsDir)
        .then(modelFiles => {
          const modelFilesFullPath = modelFiles.map(file => getModelFilesMap(standardModelsDir, file));
          this.resources.standard_models.push(...modelFilesFullPath);
          resolve(true);
        }).catch(e => {
          resolve('does not have standard models');
        });
    } catch (e) {
      reject(e);
    }
  });
}

function loadExtensionSettings(options) {
  const { extension = {}, container = {}, } = options;
  let defaultSettings = {};
  try {
    defaultSettings = (container.name) ?
      (container.type === 'local') ?
      require(`${this.config.app_root}/content/container/${container.name}/config/settings.js`) :
      require(`${container.name}/config/settings.js`) :
      require(`${extension.name}/config/settings.js`); // load default settings
  } catch (e) {
    if (this.config.debug) {
      if (container.name) {
        this.logger.warn(`${container.name} is missing default settings`, e);
      } else {
        this.logger.warn(`${extension.name} is missing default settings`, e);
      }
    }
  }
  const envConfigFilePath = (container.name) ?
    `content/config/container/${container.name}/${this.config.process.runtime}.json` :
    `content/config/extensions/${extension.name}/${this.config.process.runtime}.json`; // load environment settings
  const overrideSettings = (container.name) ?
    this.settings.container[`${container.name}`] // load override settings
    :
    this.settings.extensions[`${extension.name}`]; // load override settings
  // assign to periodic.config.settings
  return new Promise((resolve, reject) => {
    try {
      this.configuration.load({
        docid: 'filepath',
        query: envConfigFilePath,
      }).then(dbenvconfig => {
        const envconfigJSON = (dbenvconfig && dbenvconfig.toJSON) ?
          dbenvconfig.toJSON() :
          dbenvconfig || {};
        const envconfig = envconfigJSON.config;
        const updatedSettings = flatten.unflatten(
          Object.assign({},
            flatten(defaultSettings || {}),
            flatten(envconfig || {}),
            flatten(overrideSettings || {})
          )
        );
        if (updatedSettings.databases) {
          if (container.name) {
            Object.keys(updatedSettings.databases).forEach(db => {
              this.resources.databases.container[db] = updatedSettings.databases[db];
              this.resources.databases.container[db].container = container.name;
              this.resources.databases.container[db].container_type = container.type;
            });
          } else {
            Object.keys(updatedSettings.databases).forEach(db => {
              this.resources.databases.extensions[db] = updatedSettings.databases[db];
              this.resources.databases.extensions[db].extension = extension.name;
            });
          }
        }
        if (container.name) {
          this.settings.container[container.name] = updatedSettings.settings;
        } else {
          this.settings.extensions[extension.name] = updatedSettings.settings;
        }
        resolve(true);
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

function getExtensionFromMap(ext) {
  return { extension: ext, };
}

function assignExtensionResources(options) {
  const { extension = {}, container = {}, } = options;
  return new Promise((resolve, reject) => {
    try {
      const extensionModule = (container.name) ?
        (container.type === 'local') ?
        require(`${this.config.app_root}/content/container/${container.name}`) :
        require(`${container.name}`) :
        require(`${extension.name}`);
      try {
        if (container.name) {
          this.routers.set(`container_${container.name}`, {
            type: 'container',
            router: (container.type === 'local') ?
              require(`${this.config.app_root}/content/container/${container.name}/routers/index`) : require(`${container.name}/routers/index`),
          });
        } else {
          this.routers.set(`extension_${extension.name}`, {
            type: 'extension',
            router: require(`${extension.name}/routers/index`),
          });
        }
      } catch (e) {
        if (this.config.debug) {
          this.logger.warn(`${extension.name || container.name} is missing a default router`, e);
        }
      }
      try {
        if (container.name) {
          this.controllers.container.set(`${container.name}`,
            (container.type === 'local') ?
            require(`${this.config.app_root}/content/container/${container.name}/controllers/index`) :
            require(`${container.name}/controllers/index`));
        } else {
          this.controllers.extension.set(`${extension.name}`, require(`${extension.name}/controllers/index`));
        }
      } catch (e) {
        if (this.config.debug) {
          this.logger.warn(`${extension.name || container.name} is missing a default controller`, e);
        }
      }
      try {
        if (container.name) {
          this.locals.container.set(`${container.name}`,
            (container.type === 'local') ?
            require(`${this.config.app_root}/content/container/${container.name}/utilities/index`) :
            require(`${container.name}/utilities/index`));
        } else {
          this.locals.extensions.set(`${extension.name}`, require(`${extension.name}/utilities/index`));
        }
      } catch (e) {
        if (this.config.debug) {
          this.logger.warn(`${extension.name || container.name} is missing a default utilities`, e);
        }
      }
      try {
        if (container.name) {
          this.resources.commands.container.set(`${container.name}`,
            (container.type === 'local') ?
            require(`${this.config.app_root}/content/container/${container.name}/commands/index`) :
            require(`${container.name}/commands/index`));
        } else {
          this.resources.commands.extensions.set(`${extension.name}`, require(`${extension.name}/commands/index`));
        }
      } catch (e) {
        if (this.config.debug) {
          this.logger.warn(`${extension.name || container.name} is missing a default utilities`, e);
        }
      }
      try {
        const transforms = (container.name) ?
          (container.type === 'local') ?
          require(`${this.config.app_root}/content/container/${container.name}/transforms/index`) :
          require(`${container.name}/transforms/index`) :
          require(`${extension.name}/transforms/index`);
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
        //   this.logger.warn(`${extension.name} is missing a default transforms`, e);
        // }
      }
      if (typeof extensionModule !== 'function') {
        if (container.name) {
          throw new Error(`Container: ${container.name} must be a function that returns a promise`);
        } else {
          throw new Error(`Extension: ${extension.name} must be a function that returns a promise`);
        }
      }
      resolve(extensionModule());
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
      const extensionModelFiles = loadExtensionFiles.bind(this);
      const extensionList = extensions.map(getExtensionFromMap);
      //load all the files for extensions
      //load the configurations
      if (extensionList.length) {
        Promisie.each(extensionList, 5, extensionSettings)
          .then(result => {
            return Promisie.each(extensionList, 5, extensionResources);
          })
          .then(result => {
            return Promisie.each(extensionList, 5, extensionModelFiles);
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

function setupContainer() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.container && this.settings.container.name) {
        loadExtensionSettings.call(this, { container: this.settings.container })
          .then(result => {
            return assignExtensionResources.call(this, { container: this.settings.container });
          })
          .then(result => {
            return loadExtensionFiles.call(this, { container: this.settings.container });
          })
          .then(result => {
            resolve(result);
          })
          .catch(reject);
      } else {
        resolve('no-container');
      }
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  getModelFilesMap,
  loadExtensionFiles,
  loadExtensionSettings,
  getExtensionFromMap,
  assignExtensionResources,
  setupExtensions,
  setupContainer,
};