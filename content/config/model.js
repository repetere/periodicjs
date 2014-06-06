'use strict';

module.exports = function(options){
	var mongoose = options.mongoose,
		db = 
	mongoose.connect(options.dburl),
		userSchema = require('../../app/model/user.js'),
		postSchema = require('../../app/model/post.js'),
		collectionSchema = require('../../app/model/collection.js'),
		assetSchema = require('../../app/model/asset.js'),
		tagSchema = require('../../app/model/tag.js');

	if(options.debug){
		mongoose.set('debug', true);
	}
	mongoose.model('User',userSchema);
	mongoose.model('Post',postSchema);
	mongoose.model('Collection',collectionSchema);
	mongoose.model('Asset',assetSchema);
	mongoose.model('Tag',tagSchema);
};