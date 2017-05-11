'use strict';

module.exports = (options = {}) => {
  return {
    "configuration": {
      "type": "db",
      "db": options.db ||"lowkie",
      "options": Object.assign({
        "dbpath": `${options.dbpathprefix ? options.dbpathprefix+'/' :''}content/config/settings/db.json`,
      },options.db_config_options),
    },
    "settings": Object.assign({},
      {
        "name": "My Config APP",
      }, options.settingsProp),
  };  
}
