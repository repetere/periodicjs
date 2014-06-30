'use strict';

var request = require('superagent'),
	letterpress = require('letterpressjs'),
	createPeriodicTag = function(id,val,callback,url,type){
		if((id==='NEWTAG' || id==='SELECT') && val){
			request
				.post(url)
				.send({ title: val, _csrf: document.querySelector('input[name=_csrf]').value })
				.set('Accept', 'application/json')
				.end(function(error, res){
					if(res.error){
						error = res.error;
					}
					if(error){
						ribbonNotification.showRibbon( error.message,4000,'error');
					}
					else{
						if(res.body.result==='error'){
							ribbonNotification.showRibbon( res.body.data.error,4000,'error');
						}
						else if(typeof res.body.data.doc._id === 'string'){
							callback(
								res.body.data.doc._id,
								res.body.data.doc.title,
								error);	
								// console.log("type",type);
						}
					}
				});
		}
		else if(id!=='SELECT'||id!=='NEWTAG'){
			callback(id,val);
			// console.log("type",type);
		}
	},
	wysihtml5Editor,
	tag_lp = new letterpress({
		idSelector : '#padmin-tags',
		sourcedata: '/tag/search.json',
		sourcearrayname: 'tags',
		createTagFunc:function(id,val,callback){			
			createPeriodicTag(id,val,callback,'/tag/new/'+makeNiceName(document.querySelector('#padmin-tags').value)+'/?format=json&limit=200');
		}
	}),
	cat_lp = new letterpress({
		idSelector : '#padmin-categories',
		sourcedata: '/category/search.json',
		sourcearrayname: 'categories',
		createTagFunc:function(id,val,callback){			
			createPeriodicTag(id,val,callback,'/category/new/'+makeNiceName(document.querySelector('#padmin-tags').value)+'/?format=json&limit=200');
		}
	}),
	athr_lp = new letterpress({
		idSelector : '#padmin-authors',
		sourcedata: '/user/search.json',
		sourcearrayname: 'users',
		valueLabel: "username",
		disablenewtags: true,
		createTagFunc:function(id,val,callback){			
			if(id==='NEWTAG' || id==='SELECT'){
				ribbonNotification.showRibbon( "user does not exist",4000,'error');
			}
			else if(id!=='SELECT'||id!=='NEWTAG'){
				callback(id,val);
			}
		}
	}),
	cnt_lp = new letterpress({
		idSelector : '#padmin-contenttypes',
		sourcedata: '/contenttype/search.json',
		sourcearrayname: 'contenttypes',
		createTagFunc:function(id,val,callback){			
			createPeriodicTag(id,val,callback,'/contenttype/new/'+makeNiceName(document.querySelector('#padmin-contenttypes').value)+'/?format=json&limit=200',"contenttype");
		}
	});

window.addEventListener("load",function(e){
	tag_lp.init();
	cat_lp.init();
	athr_lp.init();
	cnt_lp.init();
	if(typeof posttags ==='object'){
		tag_lp.setPreloadDataObject(posttags);
	}
	if(typeof postcategories ==='object'){
		cat_lp.setPreloadDataObject(postcategories);
	}
	if(typeof postauthors ==='object'){
		athr_lp.setPreloadDataObject(postauthors);
	}
	if(typeof postcontenttypes ==='object'){
		cnt_lp.setPreloadDataObject(postcontenttypes);
	}
	ajaxFormEventListers("._pea-ajax-form");
	wysihtml5Editor = new wysihtml5.Editor("wysihtml5-textarea", { 
		// id of textarea element
		toolbar:      "wysihtml5-toolbar", // id of toolbar element
		parserRules:  wysihtml5ParserRules // defined in parser rules set 
	});
});

window.updateContentTypes = function(AjaxDataResponse){
	// console.log("runing post update");
	var contenttypeContainer = document.getElementById("doc-ct-attr"),
		updatedDoc = AjaxDataResponse.doc,
		contentTypeHtml='';
	for(var x in updatedDoc.contenttypes){
		var contentTypeData = updatedDoc.contenttypes[x];
		contentTypeHtml+='<div>';
		contentTypeHtml+='<h3 style="margin-top:0;">'+contentTypeData.title+'<small> <a href="/p-admin/contenttype/'+contentTypeData.name+'">(edit)</a></small></h3>';
		if(contentTypeData.attributes){
			for(var y in contentTypeData.attributes){
				var attr = contentTypeData.attributes[y],
					defaultVal = attr.defaultvalue || '';
				if(updatedDoc.contenttypeattributes && updatedDoc.contenttypeattributes[contentTypeData.name] && updatedDoc.contenttypeattributes[contentTypeData.name][attr.name]){
					defaultVal = updatedDoc.contenttypeattributes[contentTypeData.name][attr.name];
				}
				contentTypeHtml+='<div class="_pea-row _pea-container-forminput">';
				contentTypeHtml+='<label class="_pea-label _pea-col-span3"> '+attr.title +' </label>';
				contentTypeHtml+='<input class="_pea-col-span9 noFormSubmit" type="text" placeholder="'+attr.title +'" value="'+defaultVal +'" name="contenttypeattributes.'+contentTypeData.name +'.'+attr.name +'">';
				contentTypeHtml+='</div>';
			}
		}
		contentTypeHtml+='</div>';
	}
	contenttypeContainer.innerHTML = contentTypeHtml;
};

window.cnt_lp = cnt_lp;