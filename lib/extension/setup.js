'use strict';

function loadExtensionFiles() { 
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

function loadExtensionSettings() {
  const envConfigFilePath = `content/config/environment/${this.config.process.runtime}.json`;
  // load default settings
  // load environment settings
  // load override settings
  // assign to periodic.config.settings
  return new Promise((resolve, reject) => {
    try {
      this.configuration.load({
        docid: 'filepath',
        query: envConfigFilePath,
      }).then(envconfig => {
        const updatedSettings = Object.assign({}, defaultSettings.environment, envconfig, this.settings);
        this.settings = updatedSettings;
        this.status.emit('ready', true);
        resolve(updatedSettings);
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

function setupExtensions(){
  return new Promise((resolve, reject)=>{
    try{
      // console.log('initializing extension',this.extensions);
      resolve(true);
    } catch(e){
      reject (e);
    }
  });
}

module.exports = {
  setupExtensions,
};