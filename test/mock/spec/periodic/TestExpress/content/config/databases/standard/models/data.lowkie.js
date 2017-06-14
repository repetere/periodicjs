'use strict';
const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
    id: ObjectId,
    status: {
        type: String,
        'default': 'active'
    },
    publishat: {
        type: Date,
        'default': Date.now,
    },
    title: String,
    name: {
        type: String,
    },
    content: String,
    tags: [{
        type: ObjectId,
        ref: 'Tag'
    }],
    categories: [{
        type: ObjectId,
        ref: 'Category'
    }],
    primaryauthor: {
        type: ObjectId,
        ref: 'User'
    },
    random: Number
};

module.exports = {
    scheme,
    options: {},
    coreDataOptions: {
        docid: '_id',
        sort: { createdat: -1, },
        search: ['title', 'name', 'content'],
        population: 'tags categories primaryauthor',
    }
};