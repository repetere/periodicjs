'use strict';

var mongoose = require('mongoose'),
	async = require('async'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var categorySchema = new Schema({
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
	createdat: {
		type: Date,
		'default': Date.now
	},
	updatedat: {
		type: Date,
		'default': Date.now
	},
	contenttypes: [{
		type: ObjectId,
		ref: 'Contenttype'
	}],
	parent: [{
		type: ObjectId,
		ref: 'Category',
		index: true
	}], //http://docs.mongodb.org/manual/tutorial/model-tree-structures-with-child-references/
	//http://www.codeproject.com/Articles/521713/Storing-Tree-like-Hierarchy-Structures-With-MongoD
	attributes: Schema.Types.Mixed,
	contenttypeattributes: Schema.Types.Mixed,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});

categorySchema.pre('save', function (next, done) {
	// var badname = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
	if (this.name !== undefined && this.name.length < 1) {
		done(new Error('Tag title is too short'));
	}
	// else if (this.name !== undefined && badname.test(this.name)) {
	// 	done(new Error('Tag title(' + this.name + ') is a reserved word invalid'));
	// }
	else {
		next();
	}
});

categorySchema.methods.getChildren = function (getTagChildrenCallback) {
	var currentTag = {
			title: this.title,
			name: this.name,
			_id: this._id,
			childDocs: this.childDocs
		},
		Category = mongoose.model('Category');

	var getChildDocuments = function (documentobj, callbackGetChildDocuments) {
		console.log('check for children for: ', documentobj.name);
		var query = {
			parent: {
				$in: [documentobj._id]
			}
		};

		Category.find(query).select('name title content').exec(function (err, children) {
			if (err) {
				callbackGetChildDocuments(err, null);
			}
			else {
				documentobj.childDocs = children;
				callbackGetChildDocuments(null, documentobj);
			}
		});
	};

	getChildDocuments(currentTag, function (err, updatedCurrentDoc) {
		currentTag = updatedCurrentDoc;
		if (currentTag.childDocs.length > 0) {
			async.each(
				currentTag.childDocs,
				function (child, asynccallback) {
					child.getChildren(function (err, updatedchild) {
						for (var x in currentTag.childDocs) {
							if (currentTag.childDocs[x].name === updatedchild.name) {
								currentTag.childDocs[x] = updatedchild;
							}
						}
						asynccallback(err);
					});
				},
				function (err) {
					if (err) {
						getTagChildrenCallback(err, null);
					}
					else {
						getTagChildrenCallback(null, currentTag);
					}
				});
		}
		else {
			getTagChildrenCallback(err, currentTag);
		}
	});
};

module.exports = categorySchema;
