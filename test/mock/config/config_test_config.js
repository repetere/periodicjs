'use strict';

module.exports = (options = {}) => {
  return {
    "configuration": {
      "type": "db",
      "db": "lowkie",
      "options": {
        "dbpath": `${options.dbpathprefix ? options.dbpathprefix+'/' :''}content/config/settings/db.json`,
      }
    },
    "settings": Object.assign({},
      {
        "name": "My Config APP",
      }, options.settingsProp),
  };  
}
