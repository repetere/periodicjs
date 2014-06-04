'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var postSchema = new Schema({
    id: ObjectId,
    status: {
        type: String,
        "default": "draft"
    },
    createdat: {
        type: Date,
        "default": Date.now
    },
    updatedat: {
        type: Date,
        "default": Date.now
    },
    title: String,
    name: String,
    dek: String,
    content: String,
    posttype: {
        type: String,
        "default": "text"
    },
    tags: [{
        type:ObjectId,
        ref:"Tag"
    }],
    collections: [{
        type:ObjectId,
        ref:"Collection"
    }],
    assets: [{
        type:ObjectId,
        ref:"Asset"
    }],
    primaryasset:{
        type:ObjectId,
        ref:"Asset"
    },
    source: {
        type:ObjectId,
        ref:"Source"
    },
    originalpost :{
        originalid: String,
        originaldate: Date,
        originaldata: Schema.Types.Mixed
    },
    link: String,
    random: Number
});


postSchema.pre('save',function(next,done){
    var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
    if(this.name !== undefined && this.name.length <4){
        done(new Error('title is too short'));
    } else if(this.name !== undefined && badname.test(this.name) ){
        done(new Error('Invalid title'));
    }
    next();
});

postSchema.post('init', function (doc) {
    console.log("model - workout.js - "+doc._id+' has been initialized from the db');
});
postSchema.post('validate', function (doc) {
    console.log("model - workout.js - "+doc._id+' has been validated (but not saved yet)');
});
postSchema.post('save', function (doc) {
    // this.db.models.Post.emit('created', this);
    console.log("model - workout.js - "+doc._id+' has been saved');
});
postSchema.post('remove', function (doc) {
    console.log("model - workout.js - "+doc._id+' has been removed');
});

postSchema.statics.getRandomWorkout = function(options,callback){
    var self = this;
    // queryHelper.getRandomDocument({model:self},callback);
};

postSchema.statics.getUserWorkouts = function(options,callback){
    this.find({userid:options.user._id}).populate('media').exec(callback);
};


module.exports = postSchema;