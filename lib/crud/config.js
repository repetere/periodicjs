'use strict';
const fs = require('fs-extra');
const path = require('path');

function create(options) {
  return new Promise((resolve, reject) => {
    const createdat = Date.now();
    const updatedat = Date.now();
    const configurationDB = this.datas.get('configuration');
    try {
      if (typeof options === 'string') {
        fs.readJSON(path.resolve(options))
          .then(configJSON => {
            resolve(configurationDB.create({
              newdoc: Object.assign({},
                configJSON, {
                  createdat,
                  updatedat,
                }),
            }));
          })
          .catch(reject);
      } else {
        const { filepath, environment, container, config, } = options;
        resolve(configurationDB.create({
          newdoc: {
            filepath,
            environment,
            config,
            container,
            createdat,
            updatedat,
          }
        }));  
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
  console.log('remove',{options})
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