'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    logger = console;

var assetSchema = new Schema({
    id: ObjectId,
    title: String,
    status: {
        type: String,
        "default": "VALID"
    },
    createdat: {
        type: Date,
        "default": Date.now
    },
    // size: Number,
    author: {
        type:ObjectId,
        ref:"User"
    },
    userid: ObjectId,
    username: String,
    assettype: {
        type: String,
        "default": "image"
    },
    filename: String,
    locationtype: String,
    description: String,
    filedata: Schema.Types.Mixed,
    attributes: Schema.Types.Mixed,
    random: Number
});


assetSchema.post('init', function (doc) {
  logger.verbose("model - image.js - "+doc._id+' has been initialized from the db');
});
assetSchema.post('validate', function (doc) {
  logger.verbose("model - image.js - "+doc._id+' has been validated (but not saved yet)');
});
assetSchema.post('save', function (doc) {
  logger.verbose("model - image.js - "+doc._id+' has been saved');
});
assetSchema.post('remove', function (doc) {
  logger.verbose("model - image.js - "+doc._id+' has been removed');
});

assetSchema.statics.removeMediaAndDeleteFiles = function(options,callback){
    // var self = this;
    // mediaarraytodelete = options.media;

    // self.deleteMultipleFromS3({media:mediaarraytodelete},function(err){
    //     if(err){
    //         callback(err)
    //     }
    //     else{
    //         self.remove({ _id: {$in: mediaarraytodelete}},function(err){
    //             if(err){
    //                 callback(err)
    //             }
    //             else{
    //                 callback();
    //                 // console.log("try and delete multiple files")
    //             }
    //         });
    //     }
    // });
};

assetSchema.statics.deleteMultipleFromS3 = function(options,callback){
    // var mediaarraytodelete = options.media;
    // var appconfig = require('../config/environment');
    // var s3data = appconfig.environment.fileuploads.config.s3;
    // var self = this;

    // var awssum = require('awssum'); // var amazon = awssum.load('amazon/amazon');
    // var S3 = awssum.load('amazon/s3').S3;
    // var cred = {
    //     'accessKeyId'     : s3data.accessKeyId,
    //     'secretAccessKey' : s3data.secretAccessKey,
    //     'awsAccountId'    : s3data.awsAccountId,
    //     'region'          : s3data.region
    // };
    // var s3 = new S3(cred);

    // self.find({_id: {$in: mediaarraytodelete}},function(err,mediaObjects){
    //     // console.log("looping now for files","mediaarraytodelete",mediaarraytodelete,"err",err,"mediaObjects",mediaObjects)
    //     if(err){
    //         callback(err);
    //     }
    //     if(mediaObjects){
    //         for(x in mediaObjects){
    //             console.log("trying to delete mediaObjects["+x+"]")
    //             var params = {
    //                 BucketName : s3data.bucketName,
    //                 ObjectName : mediaObjects[x].filedata.s3ObjectName
    //             };
    //             s3.DeleteObject(params, function(err,data){
    //                 if(err){
    //                     callback(err);
    //                 }
    //                 else{
    //                     callback(null)
    //                 }
    //             });
    //         }
    //     }
    //     else{
    //         callback(new Error("invalid request for media"))
    //     }
    // })
};

assetSchema.methods.addMediaToDocument = function(options,callback){
    // var newMediaItem = this;
    // switch(options.model){
    //     case "user":
    //         // console.log("trying to add media to model")
    //         User = mongoose.model("User");
    //         User.findById(options.modelid,function(err,user){
    //             if(err){
    //                 logger.error(err)
    //                 callback(err,null);
    //             }
    //             else{
    //                 user['media'].push(newMediaItem._id);
    //                 user.save(callback);
    //             }
    //         })
    //         break;
    //     // case "exercise":
    //     //     // console.log("trying to add media to exercise")
    //     //     Exercise = mongoose.model("Exercise");
    //     //     Exercise.findById(options.modelid,function(err,exercise){
    //     //         if(err){
    //     //             logger.error(err)
    //     //             callback(err,null);
    //     //         }
    //     //         else{
    //     //             exercise['media'].push(newMediaItem._id);
    //     //             exercise.save(callback)
    //     //         }
    //     //     })
    //     //     break;
    //     // case "workout":
    //     //     // console.log("trying to add media to model")
    //     //     Workout = mongoose.model("Workout");
    //     //     Workout.findById(options.modelid,function(err,workout){
    //     //         if(err){
    //     //             logger.error(err)
    //     //             callback(err,null);
    //     //         }
    //     //         else{
    //     //             workout['media'].push(newMediaItem._id);
    //     //             workout.save(callback)
    //     //         }
    //     //     })
    //     //     break;
    //     // case "activity":
    //     // default:
    //     //     // console.log("trying to add media to model")
    //     //     Activity = mongoose.model("Activity");
    //     //     Activity.findById(options.modelid,function(err,activity){
    //     //         if(err){
    //     //             logger.error(err)
    //     //             callback(err,null);
    //     //         }
    //     //         else{
    //     //             activity['media'].push(newMediaItem._id);
    //     //             activity.save(callback)
    //     //         }
    //     //     })
    //     //     break;
    // }
};

assetSchema.methods.deleteFromS3 = function(options,callback){
    // var mediaObject = this;
    // var awssum = require('awssum'); // var amazon = awssum.load('amazon/amazon');
    // var S3 = awssum.load('amazon/s3').S3;
    // var cred = {
    //     'accessKeyId'     : options.accessKeyId,
    //     'secretAccessKey' : options.secretAccessKey,
    //     'awsAccountId'    : options.awsAccountId,
    //     'region'          : options.region
    // };
    // var s3 = new S3(cred);
    // var params = {
    //     BucketName : options.bucketName,
    //     ObjectName : media.filedata.s3ObjectName
    // };
    // s3.DeleteObject(params, callback);
    // // s3.DeleteObject(params, function(err, data) {
    // //     fmt.dump(err, 'Error');
    // //     fmt.dump(data, 'Data');
    // // });
};

module.exports = assetSchema;