'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var tagSchema = new Schema({
    id: ObjectId,
    title: String,
    name: {
        type: String, unique: true
    },
    description: String,
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
        ref:"Tag"
    }], //http://docs.mongodb.org/manual/tutorial/model-tree-structures-with-child-references/
    attributes: Schema.Types.Mixed,
    extensionattributes: Schema.Types.Mixed,
    random: Number
});

tagSchema.pre('save',function(next,done){
    var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
    if(this.name !== undefined && this.name.length <4){
        done(new Error('Tag title is too short'));
    }
    else if(this.name !== undefined && badname.test(this.name) ){
        done(new Error('Tag title('+this.name+') is a reserved word invalid'));
    }
    else{
        next();
    }
});

tagSchema.post('init', function (doc) {
    console.log("model - tag.js - "+doc._id+' has been initialized from the db');
});
tagSchema.post('validate', function (doc) {
    console.log("model - tag.js - "+doc._id+' has been validated (but not saved yet)');
});
tagSchema.post('save', function (doc) {
    // this.db.models.Item.emit('created', this);
    console.log("model - tag.js - "+doc._id+' has been saved');
});
tagSchema.post('remove', function (doc) {
    console.log("model - tag.js - "+doc._id+' has been removed');
});

tagSchema.statics.getRandomWorkout = function(options,callback){
    var self = this;
    // queryHelper.getRandomDocument({model:self},callback);
};

module.exports = tagSchema;