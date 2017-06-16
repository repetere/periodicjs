'use strict';
const fs = require('fs-extra');
const path = require('path');
const structurePath = path.resolve(__dirname, './__EXT_CONTAINER_STRUCTURE');

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
  const createdat = new Date(); //Date.now();
  const updatedat = new Date(); //Date.now();
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
            (_id) ? { _id, } : {}, {
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
            // console.log({result,options});
            deletedDoc = result;
            return this.tasks.resetExtensions();
          })
          .then(resetedExtensions => {
            // console.log('DELETED ID',{deletedDoc})
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
            // console.log({deletedDoc,options});
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

function init(container, options) {
  //
  return new Promise((resolve, reject) => {
    try {
      const extensionName = options.toString();
      const extensionPath = (container) ?
        path.join(this.config.app_root, 'content/container', extensionName) :
        path.join(this.config.app_root, 'node_modules', extensionName);
      const extensionPackageJsonPath = path.join(extensionPath, 'package.json');
      //create directory for extension
      fs.ensureDir(extensionPath)
        .then(() => {
          //copy structure
          return fs.copy(structurePath, extensionPath, { overwrite: false, });
        })
        .then(() => {
          return fs.readJSON(extensionPackageJsonPath);
        })
        .then(extPackageJson => {
          const updatedJSON = Object.assign({}, extPackageJson);
          updatedJSON.name = extensionName;
          //update package.json
          return fs.outputJSON(extensionPackageJsonPath, updatedJSON, { spaces: 2, });
        })
        .then(() => {
          //update readme
          resolve(fs.outputFile(path.join(extensionPath, 'README.md'), generateREADME({extensionName})));
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

function generateREADME(options) {
  const { extensionName, repoUserName='githubUserOrgName', repoPackageName = '' } = options;
  return `# ${extensionName} [![Coverage Status](https://coveralls.io/repos/github/${repoUserName}/${repoPackageName ||extensionName}/badge.svg?branch=master)](https://coveralls.io/github/${repoUserName}/${repoPackageName || extensionName}?branch=master) [![Build Status](https://travis-ci.org/${repoUserName}/${repoPackageName || extensionName}.svg?branch=master)](https://travis-ci.org/${repoUserName}/${repoPackageName || extensionName})

A simple extension.

[API Documentation](https://github.com/${repoUserName}/${repoPackageName || extensionName}/blob/master/doc/api.md)

## Usage

### CLI TASK

You can preform a task via CLI
\`\`\`
$ cd path/to/application/root
### Using the CLI
$ periodicjs ext ${extensionName} hello  
### Calling Manually
$ node index.js --cli --command --ext --name=${extensionName} --task=hello 
\`\`\`

## Configuration

You can configure ${extensionName}

### Default Configuration
\`\`\`javascript
{
  settings: {
    defaults: true,
  },
  databases: {
  },
};
\`\`\`


## Installation

### Installing the Extension

Install like any other extension, run \`npm run install ${extensionName}\` from your periodic application root directory and then run \`periodicjs addExtension ${extensionName}\`.
\`\`\`
$ cd path/to/application/root
$ npm run install ${extensionName}
$ periodicjs addExtension ${extensionName}
\`\`\`
### Uninstalling the Extension

Run \`npm run uninstall ${extensionName}\` from your periodic application root directory and then run \`periodicjs removeExtension ${extensionName}\`.
\`\`\`
$ cd path/to/application/root
$ npm run uninstall ${extensionName}
$ periodicjs removeExtension ${extensionName}
\`\`\`


## Testing
*Make sure you have grunt installed*
\`\`\`
$ npm install -g grunt-cli
\`\`\`

Then run grunt test or npm test
\`\`\`
$ grunt test && grunt coveralls #or locally $ npm test
\`\`\`
For generating documentation
\`\`\`
$ grunt doc
$ jsdoc2md commands/**/*.js config/**/*.js controllers/**/*.js  transforms/**/*.js utilities/**/*.js index.js > doc/api.md
\`\`\`
##Notes
* Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation`;
}

module.exports = {
  getExtensionPaths,
  getExtensionDoc,
  generateREADME,
  create,
  remove,
  update,
  list,
  init,
};