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
    author: {
        type: ObjectId,
        ref: 'User'
    },
    attributes: [{
        title: String,
        name: String,
        description: String,
        datatype: String,
        data: Schema.Types.Mixed,
        defaultvalue: String
    }]
};

module.exports = {
    scheme,
    options: {},
    coreDataOptions: {
        docid: '_id',
        sort: { createdat: -1, },
        search: ['title', 'name', ],
        population: 'author'
    }
};