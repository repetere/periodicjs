'use strict';
const fs = require('fs-extra');
const path = require('path');

function getExtensionPaths(options) {
  if (options.source !== 'npm') {
    throw new Error('invalid extension type');
  }
  return {
    package: path.join(this.config.app_root, 'node_modules', options.name, 'package.json'),
    ext: path.join(this.config.app_root, 'node_modules', options.name, 'periodicjs.ext.json'),
  };
}

function getExtensionDoc(options) {
  const createdat = Date.now();
  const updatedat = Date.now();
  const { ext_package_json, ext_config_json, ext_source, } = options;
  const ext = Object.assign({},
    ext_config_json, {
      name: ext_package_json.name,
      version: ext_package_json.version,
      author: ext_package_json.author,
      contributors: ext_package_json.contributors,
      description: ext_package_json.description,
      source: ext_source,
      enabled: (typeof options.enabled === 'boolean') ? options.enabled : true,
      createdat,
      updatedat,
    });

  // console.log({ ext_package_json, ext_config_json, ext_source, ext })
  if (!ext.name) {
    throw new Error('Extension package.json is missing a name');
  }
  if (!ext.version) {
    throw new Error('Extension package.json is missing a version');
  }
  if (typeof ext.type !== 'number') {
    throw new Error('Extension periodicjs.ext.json is missing a type classification (0-core, 1-communication, 2-auth, 3-uac, 4-api, 5-admin,6-data,7-ui)');
  }
  if (typeof ext.priority !== 'number') {
    throw new Error('Extension periodicjs.ext.json is missing a priority');
  }
  if (!ext.periodic_compatibility) {
    throw new Error('Extension periodicjs.ext.json is missing a periodic_compatibility');
  }
  if (!ext.periodic_config) {
    throw new Error('Extension periodicjs.ext.json is missing a periodic_config');
  }

  return ext;
}

function create(options) {
  return new Promise((resolve, reject) => {
    try {
      const newdocOptions = Object.assign({}, options);
      if (typeof options === 'string') {
        newdocOptions.source = 'npm';
        newdocOptions.name = options;
      }
      const ext_source = newdocOptions.source;
      const extensionDB = this.datas.get('extension');
      const extPath = getExtensionPaths.call(this, newdocOptions);
      switch (ext_source) {
        case 'npm':
        default:
          Promise.all([
              fs.readJSON(extPath.package),
              fs.readJSON(extPath.ext),
            ])
            .then(results => {
              const [ext_package_json, ext_config_json, ] = results;
              const newdoc = getExtensionDoc({ ext_package_json, ext_config_json, ext_source, });
              resolve(extensionDB.create({ newdoc, }));
            })
            .catch(reject);
          break;
      }
    } catch (e) {
      reject(e);
    }
  });
}

function update(options) {
  return new Promise((resolve, reject) => {
    const { filepath, _id } = options;
    const createdat = Date.now();
    const updatedat = Date.now();
    const configurationDB = this.datas.get('configuration');
    try {
      resolve(configurationDB.update({
        updatedoc: {
          filepath,
          environment,
          container,
          createdat,
          updatedat,
        }
      }));
    } catch (e) {
      reject(e);
    }
  });
}

function remove(options) {
  return new Promise((resolve, reject) => {
    let { filepath, _id, id } = options;
    const configurationDB = this.datas.get('configuration');
    try {
      if (typeof options === 'string') {
        id = options;
      }
      if (id || _id) {
        resolve(configurationDB.delete({
          id: id || _id,
        }));
      } else {
        configurationDB.load({ docid: 'filepath', query: filepath })
          .then(result => {
            resolve(configurationDB.delete({ id: result.id }));
          })
          .catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  create,
  remove,
  update,
};