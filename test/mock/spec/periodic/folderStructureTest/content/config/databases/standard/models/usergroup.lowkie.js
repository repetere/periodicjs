'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
    id: ObjectId,
    usergroupid: {
        type: Number,
    },
    title: String,
    name: {
        type: String,
    },
    roles: [{
        type: ObjectId,
        ref: 'Userrole'
    }],
    author: {
        type: ObjectId,
        ref: 'User'
    },
    description: String,
    random: Number
};

module.exports = {
    scheme,
    options: {},
    coreDataOptions: {
        docid: '_id',
        sort: { createdat: -1, },
        search: ['title', 'name', 'description'],
        population: 'roles author'
    }
};