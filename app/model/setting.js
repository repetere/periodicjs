'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var settingSchema = new Schema({
	id: ObjectId,
	name: {
		type: String,
		unique: true
	},
	value: Schema.Types.Mixed,
	attributes: Schema.Types.Mixed,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});


module.exports = settingSchema;
