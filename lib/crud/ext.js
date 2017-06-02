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
  // console.log({ ext_config_json });
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
  if (typeof ext.periodic_type !== 'number') {
    throw new Error('Extension periodicjs.ext.json is missing a periodic_type classification (0-core, 1-communication, 2-auth, 3-uac, 4-api, 5-admin,6-data,7-ui)');
  }
  if (typeof ext.periodic_priority !== 'number') {
    throw new Error('Extension periodicjs.ext.json is missing a periodic_priority');
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
      let createdExt;
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
              return extensionDB.create({ newdoc, });
            })
            .then(createdDoc => {
              createdExt = createdDoc;
              return this.tasks.resetExtensions();
            })
            .then(resetedExtensions => {
              console.log({ resetedExtensions });
              resolve(createdExt);
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
    const { ext, _id, } = options;
    const createdat = Date.now();
    const updatedat = Date.now();
    const extensionDB = this.datas.get('extension');
    let updatedDoc;
    try {
      extensionDB.update({
        updatedoc: Object.assign({},
          ext,
          (_id) ? { _id, } : {},
          {
            createdat,
            updatedat,
          }),
      })
        .then(updatedExt => {
          updatedDoc = updatedExt;
          return this.tasks.resetExtensions();
        })
        .then(resetedExtensions => {
          resolve(updatedDoc);
        })
        .catch(reject);
      // resolve();
    } catch (e) {
      reject(e);
    }
  });
}

function remove(options) {
  return new Promise((resolve, reject) => {
    let { name, _id, } = options;
    const extensionDB = this.datas.get('extension');
    let deletedDoc;
    try {
      if (typeof options === 'string') {
        name = options;
      }
      // this.logger.info({ name, _id, });
      if (_id) {
        extensionDB.delete({
          id: _id,
        })
          .then(result => {
            deletedDoc = result;
            return this.tasks.resetExtensions();
          })
          .then(resetedExtensions => {
            resolve(deletedDoc);
          })
          .catch(reject);

        resolve();
      } else {
        extensionDB.load({ docid: 'name', query: name, })
          .then(result => {
            if (!result) {
              resolve('extension not found');
            } else {
              return extensionDB.delete({ id: result._id, });
            }
          })
          .then(result => {
            deletedDoc = result;
            return this.tasks.resetExtensions();
          })
          .then(resetedExtensions => {
            resolve(deletedDoc);
          })
          .catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function list(options) {
  return new Promise((resolve, reject) => {
    try {
      this.datas.get('extension')
        .search({
          query: {},
          limit: 1000,
          sort: {
            periodic_type: 1,
            periodic_priority: 1,
          },
          //$p.crud.ext.list().then(console.log).catch(console.error);
          // $p.datas.get('extension').search({ query:{}, limit:1000, 
          // sort: [ 
          // [ 'periodic_type', 'ASC' ], 
          // [ 'periodic_priority', 'ASC' ], 
          // ],
          // }).then(result => { console.log({ result }) }).catch(console.error);
        })
        .then(resolve)
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  getExtensionPaths,
  getExtensionDoc,
  create,
  remove,
  update,
  list,
};