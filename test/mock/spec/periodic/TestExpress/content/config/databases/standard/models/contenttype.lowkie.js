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