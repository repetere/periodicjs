'use strict';
const Sequelize = require('sequelize');

const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    // type: Sequelize.UUID,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    unique: 'user_name'
  },
  email: {
    type: Sequelize.STRING,
  },
  firstname: {
    type: Sequelize.STRING,
  },
  lastname: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  url: {
    type: Sequelize.STRING,
  },
  birthday: {
    type: Sequelize.DATE,
  },
  userid: {
    type: Sequelize.INTEGER,
  },
  accesstoken: {
    type: Sequelize.STRING,
  },
  gender: {
    type: Sequelize.STRING,
  },
  activated: {
    type: Sequelize.BOOLEAN,
  },
  description: {
    type: Sequelize.TEXT,
    default: 'No Profile',
  },
  accounttype: {
    type: Sequelize.STRING,
    default: 'basic',
  },
  // location_city: {
  //   type: Sequelize.BOOLEAN,
  // },
  // location_country: {
  //   type: Sequelize.BOOLEAN,
  // },
  // location_state: {
  //   type: Sequelize.BOOLEAN,
  // },
  // location_zip: {
  //   type: Sequelize.BOOLEAN,
  // },
  // location_longitude: {
  //   type: Sequelize.INTEGER,
  // },
  // location_latitude: {
  //   type: Sequelize.INTEGER,
  // },
  location: {
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('location') ? JSON.parse(this.getDataValue('location')) : {};
    },
    set(val) {
      this.setDataValue('location', JSON.stringify(val));
    },
  },
  // primaryasset: {
  //   allowNull: true,
  //   type: Sequelize.INTEGER,
  //   references: {
  //     model: 'asset',
  //     key:'_id',
  //   },
  // },
};


const options = {
  underscored: true,
  timestamps: true,
  indexes: [
    {
      fields: [
        'createdat',
      ],
    },
  ],
  createdAt: 'createdat',
  updatedAt: 'updatedat',
};

const associations = [
  {
    target: 'asset',
    association: 'belongsTo',
    source: 'user',
    options: {
      as: 'primaryasset',
      foreignKey: 'primaryasset_ufk',
    },
  },
  // {
  //   target: 'user',
  //   association: 'hasOne',
  //   source: 'asset',
  //   options: {
  //     as: 'coverimage',
  //     foreignKey: 'coverimage',
  //   },
  // },
  // {
  //   source: 'asset',
  //   association: 'hasMany',
  //   target: 'user',
  //   options: {
  //     as: 'primaryasset',
  //     foreignKey: 'primaryasset',
  //   },
  // },
  // {
  //   source: 'asset',
  //   association: 'hasMany',
  //   target: 'user',
  //   options: {
  //     as: 'coverimage',
  //     foreignKey: 'coverimage',
  //   },
  // },
  {
    source: 'user',
    association: 'belongsToMany',
    target: 'asset',
    options: {
      as: 'assets',
      through: 'user_assets',
    },
  },
  {
    source: 'user',
    association: 'belongsToMany',
    target: 'asset',
    options: {
      as:'coverimages',
      through: 'user_coverimages',
    },
  },
  {
    source: 'user',
    association: 'belongsToMany',
    target: 'userrole',
    options: {
      as:'userroles',
      through: 'user_userroles',
    },
  },
  {
    source: 'user',
    association: 'belongsToMany',
    target: 'tag',
    options: {
      as:'tags',
      through: 'user_tags',
    },
  },
  {
    source: 'user',
    association: 'belongsToMany',
    target: 'category',
    options: {
      as:'categories',
      through: 'user_categories',
    },
  },
];

module.exports = {
  scheme,
  options,
  associations,
  coreDataOptions: {
    docid: ['_id', 'name', ],
    sort: { createdat: -1, },
    search: ['email', 'firstname', 'lastname', 'name', ],
    // limit: 500,
    // skip: 0,
    population: 'coverimage coverimages primaryasset assets userroles tags categories contenttypes',
    // fields: {},
    // pagelength:15,
    // tract_changes:true,
    // xss_whitelist:['p','b'],
  },
};