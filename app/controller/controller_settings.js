'use strict';

module.exports.user = {
	model_name:'user',
	load_model_population:'assets coverimages primaryasset coverimage userroles contenttypes tags categories',
	load_multiple_model_population:'assets coverimages primaryasset coverimage userroles',
	docnamelookup : 'username',
	searchfields : ['username','firstname','lastname','email'],
	use_full_data:true
};

module.exports.account = {
	model_name:'account',
	load_model_population:'assets coverimages primaryasset coverimage userroles contenttypes tags categories',
	load_multiple_model_population:'assets coverimages primaryasset coverimage userroles',
	docnamelookup : 'username',
	searchfields : ['username','firstname','lastname','email'],
	use_full_data:true
};

module.exports.userrole = {
	model_name:'userrole',
	load_model_population:'privileges',
	load_multiple_model_population:'privileges',
	searchfields : ['title','name','userroleid'],
	use_full_data:true
};

module.exports.userprivilege = {
	model_name:'userprivilege',
	searchfields : ['title','name','userprivilegeid'],
	use_full_data:false
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

module.exports.contenttype = {
	model_name:'contenttype',
	load_model_population:'author' ,
	load_multiple_model_population:'author',
	use_full_data:false,
	use_taxonomy_controllers:true,
};

module.exports.asset = {
		model_name:'asset',
		load_model_population:'author contenttypes tags categories authors' ,
		load_multiple_model_population:'author contenttypes tags categories authors',
		use_full_data:false,
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
	load_model_population:'contenttypes parent primaryasset' ,
	load_multiple_model_population:'contenttypes parent primaryasset',
	use_full_data:false,
	use_children_parent_controllers:true,
	use_taxonomy_controllers:true,
};

module.exports.category = {
	model_name:'category',
	load_model_population:'contenttypes parent primaryasset' ,
	load_multiple_model_population:'contenttypes parent primaryasset',
	use_full_data:false,
	use_children_parent_controllers:true,
	use_taxonomy_controllers:true,
};