'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var contenttypeSchema = new Schema({
    id: ObjectId,
    title: String,
    name: {
        type: String, unique: true
    },
    author: {
        type:ObjectId,
        ref:"User"
    },
    attributes:[{
        name: String,
        type: String,
        defaultvalue: String,
    }]
});

contenttypeSchema.pre('save',function(next,done){
    var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
    if(this.name !== undefined && this.name.length <4){
        done(new Error('Tag title is too short'));
    }
    else if(this.name !== undefined && badname.test(this.name) ){
        done(new Error('Tag title is invalid'));
    }
    else{
        next();
    }
});

contenttypeSchema.post('init', function (doc) {
    console.log("model - contenttype.js - "+doc._id+' has been initialized from the db');
});
contenttypeSchema.post('validate', function (doc) {
    console.log("model - contenttype.js - "+doc._id+' has been validated (but not saved yet)');
});
contenttypeSchema.post('save', function (doc) {
    // this.db.models.Post.emit('created', this);
    console.log("model - contenttype.js - "+doc._id+' has been saved');
});
contenttypeSchema.post('remove', function (doc) {
    console.log("model - contenttype.js - "+doc._id+' has been removed');
});

contenttypeSchema.statics.getRandomWorkout = function(options,callback){
    var self = this;
    // queryHelper.getRandomDocument({model:self},callback);
};

module.exports = contenttypeSchema;