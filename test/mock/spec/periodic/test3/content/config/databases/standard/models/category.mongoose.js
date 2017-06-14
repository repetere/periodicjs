'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
    id: ObjectId,
    title: String,
    name: {
        type: String,
        unique: true
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
        ref: 'Category',
        index: true
    }],
    random: Number
};

module.exports = {
    scheme,
    options: {},
    coreDataOptions: {
        docid: '_id',
        sort: { createdat: -1, },
        search: ['title', 'name', 'dek', 'content', ],
        population: 'author primaryasset parent'
    }
};