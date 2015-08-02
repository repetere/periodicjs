'use strict';

module.exports.user = {
	model_name:'user',
	load_model_population:'assets coverimages primaryasset coverimage userroles',
	load_multiple_model_population:'assets coverimages primaryasset coverimage userroles',
	docnamelookup : 'username',
	searchFields : ['username','firstname','lastname','email'],
	use_full_data:true
};

module.exports.item = {
	model_name:'item',
	load_model_population:'tags contenttypes categories assets primaryasset authors primaryauthor',
	load_multiple_model_population:'tags contenttypes categories assets primaryasset authors primaryauthor',
	use_full_data:true
};

module.exports.data = {
	model_name:'data',
	load_model_population:'contenttypes tags categories primaryauthor',
	load_multiple_model_population:'contenttypes tags categories primaryauthor',
	use_full_data:true
};

module.exports.collection = {
	model_name:'collection',
	load_model_population:'tags categories contenttypes assets primaryasset authors primaryauthor  items.item' ,
	load_multiple_model_population:'tags categories authors assets primaryasset contenttypes primaryauthor items',
	use_full_data:false,
	use_append_array_data:true,
	use_remove_array_data:true
};

module.exports.compilation = {
	model_name:'compilation',
	load_model_population:'tags categories authors assets primaryasset contenttypes primaryauthor content_entities' ,
	load_multiple_model_population:'tags categories authors contenttypes primaryauthor primaryasset assets content_entities.entity_item content_entities.entity_collection',
	use_full_data:false,
	use_append_array_data:true,
	use_remove_array_data:true
};

module.exports.tag = {
	model_name:'tag',
	load_model_population:'contenttypes parent' ,
	load_multiple_model_population:'contenttypes parent',
	use_full_data:false,
	use_children_parent_controllers:true,
	use_taxonomy_controllers:true,
};

module.exports.category = {
	model_name:'category',
	load_model_population:'contenttypes parent' ,
	load_multiple_model_population:'contenttypes parent',
	use_full_data:false,
	use_children_parent_controllers:true,
	use_taxonomy_controllers:true,
};