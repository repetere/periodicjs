'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
    id: ObjectId,
    userprivilegeid: {
        type: Number,
        unique: true
    },
    title: String,
    name: {
        type: String,
        unique: true
    },
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
        population: 'author'
    }
};