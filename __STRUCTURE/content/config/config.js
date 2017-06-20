'use strict';

module.exports = () => {
  return Promise.resolve({
    configuration: {
      type: 'db',
      db: 'lowkie',
      options: {
        dbpath: 'content/config/settings/config_db.json',
      },
    },
    settings: {
      name: 'My Application',
    },
  });
}

/**
 * Other sample configurations
 *
 *-------MONGO CONFIGURATION DB --------
    'configuration': {
      'type': 'db',
      'db': 'mongoose',
      'options': {
        'url': 'mongodb://localhost:27017/config_db',
        'connection_options': {},
      },
    },
 *-------MONGO CONFIGURATION DB --------
 *-------SQL CONFIGURATION DB --------
    'SEQUELIZE': {
      'type': 'db',
      'db': 'sequelize',
      'options': {
        'database': 'configdb',
        'username': '',
        'password': '',
        'connection_options': {
          'dialect': 'postgres',
          'port': 5432,
          'host': '127.0.0.1',
        },
      },
    },
 *-------SQL CONFIGURATION DB --------
 */