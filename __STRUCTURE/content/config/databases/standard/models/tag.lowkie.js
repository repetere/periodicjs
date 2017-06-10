'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
    id: ObjectId,
    title: String,
    name: {
        type: String,
    },
    dek: String,
    content: String,
    author: {
        type: ObjectId,
        ref: 'User'
    },
    primaryasset: {
        type: ObjectId,
        ref: 'Asset'
    },
    parent: [{
        type: ObjectId,
        ref: 'Tag'
    }],
    random: Number
};

module.exports = {
    scheme,
    options: {},
    coreDataOptions: {
        docid: '_id',
        sort: { createdat: -1, },
        search: ['title', 'name', 'dek', 'content'],
        population: 'author primaryasset parent',
    }
};