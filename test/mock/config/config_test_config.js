'use strict';

module.exports = (options = {}) => {
  return {
    "configuration": {
      "type": options.config_type||"db",
      "db": options.db ||"lowkie",
      "options": Object.assign({
        "dbpath": `${options.dbpathprefix ? options.dbpathprefix+'/' :''}content/config/settings/config_db.json`,
      },options.db_config_options),
    },
    "settings": Object.assign({},
      {
        "name": "My Config APP",
      }, options.settingsProp),
  };  
}
