'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
    id: ObjectId,
    userroleid: Number,
    title: String,
    name: String,
    privileges: [{
        type: ObjectId,
        ref: 'Userprivilege'
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
        population: 'privileges author',
    }
};