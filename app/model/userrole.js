'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var userroleSchema = new Schema({
	id: ObjectId,
	userroleid: {
		type: Number,
		unique: true
	},
	title: String,
	name: {
		type: String,
		unique: true
	},
	privileges: [{
		type: ObjectId,
		ref: 'Userprivilege'
	}],
	author: {
		type: ObjectId,
		ref: 'User'
	},
	description: String,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});

userroleSchema.pre('save', function (next, done) {
	if (this.name !== undefined && this.name.length < 4) {
		done(new Error('User role title is too short'));
	}
	// else if(this.name !== undefined && badname.test(this.name) ){
	//     done(new Error('User role title('+this.name+') is a reserved word invalid'));
	// }
	else {
		next();
	}
});

module.exports = userroleSchema;
