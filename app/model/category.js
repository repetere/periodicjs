'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var categorySchema = new Schema({
    id: ObjectId,
    title: String,
    name: {
        type: String, unique: true
    },
    dek: String,
    content: String,
    author: {
        type:ObjectId,
        ref:"User"
    },
    primaryasset:{
        type:ObjectId,
        ref:"Asset"
    },
    createdat: {
        type: Date,
        "default": Date.now
    },
    updatedat: {
        type: Date,
        "default": Date.now
    },
    children: [{
        type:ObjectId,
        ref:"Category",
        index: true
    }], //http://docs.mongodb.org/manual/tutorial/model-tree-structures-with-child-references/
    //http://www.codeproject.com/Articles/521713/Storing-Tree-like-Hierarchy-Structures-With-MongoD
    attributes: Schema.Types.Mixed,
    random: Number
});

categorySchema.pre('save',function(next,done){
    // var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
    // if(this.name !== undefined && this.name.length <4){
    //     done(new Error('title is too short'));
    // } else if(this.name !== undefined && badname.test(this.name) ){
    //     done(new Error('Invalid title'));
    // }
    next();
});

categorySchema.post('init', function (doc) {
    console.log("model - category.js - "+doc._id+' has been initialized from the db');
});
categorySchema.post('validate', function (doc) {
    console.log("model - category.js - "+doc._id+' has been validated (but not saved yet)');
});
categorySchema.post('save', function (doc) {
    // this.db.models.Post.emit('created', this);
    console.log("model - category.js - "+doc._id+' has been saved');
});
categorySchema.post('remove', function (doc) {
    console.log("model - category.js - "+doc._id+' has been removed');
});

categorySchema.statics.getRandomWorkout = function(options,callback){
    var self = this;
    // queryHelper.getRandomDocument({model:self},callback);
};

module.exports = categorySchema;