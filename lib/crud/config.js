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
                    },
                }));
            }
        } catch (e) {
            reject(e);
        }
    });
}

function update(options) {
    return new Promise((resolve, reject) => {
        const { config, _id, } = options;
        const createdat = Date.now();
        const updatedat = Date.now();
        const configurationDB = this.datas.get('configuration');
        try {
            resolve(configurationDB.update({
                updatedoc: Object.assign({},
                    config,
                    (_id) ? { _id, } : {}, {
                        createdat,
                        updatedat,
                    }),
            }));
        } catch (e) {
            reject(e);
        }
    });
}

function remove(options) {
    return new Promise((resolve, reject) => {
        let { filepath, _id, id, } = options;
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
                configurationDB.load({ docid: 'filepath', query: filepath, })
                    .then(result => {
                        resolve(configurationDB.delete({ id: result._id, }));
                    })
                    .catch(reject);
            }
        } catch (e) {
            reject(e);
        }
    });
}

function getFilePath(options) {
    const { type, name, environment, filepath } = options;
    switch (type) {
        case 'app':
        case 'application':
        case 'environment':
            return {
                configFilePath: `content/config/environment/${environment}.json`,
                configDefaultSettings: Object.assign({}, this.settings, {
                    extensions: {},
                    container: {},
                }),
            };
        case 'ext':
        case 'extension':
            return {
                configFilePath: `content/config/extensions/${name}/${environment}.json`,
                configDefaultSettings: require(`${name}/config/settings`),
            };
        case 'ext-local':
        case 'extension-local':
            return {
                configFilePath: `content/config/extensions/${name}/${environment}.json`,
                configDefaultSettings: require(path.resolve(this.config.app_root, `content/extensions/${name}/config/settings`)),
            };
        case 'con':
        case 'container':
            return {
                configFilePath: `content/config/containers/${name}/${environment}.json`,
                configDefaultSettings: require(`${name}/config/settings`),
            };
        case 'con-local':
        case 'container-local':
            return {
                configFilePath: `content/config/containers/${name}/${environment}.json`,
                configDefaultSettings: require(path.resolve(this.config.app_root, `content/container/${name}/config/settings`)),
            };
        default:
            throw new Error(`Invalid configuration type (${type}) [app,application,environment|ext,ext-local,extension,extension-local|con,con-local,container,container-local]`);
    }
}

function init(options) {
    return new Promise((resolve, reject) => {
        if (typeof options === 'string') {
            // crud_arg: `${argv.type},${argv.environment},${argv.name},${argv.filepath}`,
            var [type, name, environment, filepath] = options.split(',');
        } else {
            var { type, name, environment, filepath } = options;
        }
        const { configFilePath, configDefaultSettings } = getFilePath.call(this, { type, name, environment, filepath });
        resolve(fs.outputJSON(filepath, {
            filepath: configFilePath,
            environment,
            config: configDefaultSettings,
        }, { spaces: 2, }));
    });
}

module.exports = {
    create,
    remove,
    update,
    init,
};