'use strict';
const mongoose = require('mongoose');

let customized_standard_models = function(resources){
	return {
		user: {
			customSchemaData: {
				customusertype: {
					type: String,
					'default': 'basic'
				},
			},
		},
	};	
};

module.exports = customized_standard_models;