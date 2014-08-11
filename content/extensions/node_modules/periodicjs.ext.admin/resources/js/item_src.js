'use strict';

var request = require('superagent'),
	letterpress = require('letterpressjs'),
	updatemedia = require('./updatemedia'),
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
						window.ribbonNotification.showRibbon( error.message,4000,'error');
					}
					else{
						if(res.body.result==='error'){
							window.ribbonNotification.showRibbon( res.body.data.error,4000,'error');
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
			console.log('type',type);
		}
	},
	wysihtml5Editor,
	tag_lp = new letterpress({
		idSelector : '#padmin-tags',
		sourcedata: '/tag/search.json',
		sourcearrayname: 'tags',
		createTagFunc:function(id,val,callback){			
			createPeriodicTag(id,val,callback,'/tag/new/'+window.makeNiceName(document.querySelector('#padmin-tags').value)+'/?format=json&limit=200');
		}
	}),
	cat_lp = new letterpress({
		idSelector : '#padmin-categories',
		sourcedata: '/category/search.json',
		sourcearrayname: 'categories',
		createTagFunc:function(id,val,callback){			
			createPeriodicTag(id,val,callback,'/category/new/'+window.makeNiceName(document.querySelector('#padmin-tags').value)+'/?format=json&limit=200');
		}
	}),
	athr_lp = new letterpress({
		idSelector : '#padmin-authors',
		sourcedata: '/user/search.json',
		sourcearrayname: 'users',
		valueLabel: 'username',
		disablenewtags: true,
		createTagFunc:function(id,val,callback){			
			if(id==='NEWTAG' || id==='SELECT'){
				window.ribbonNotification.showRibbon( 'user does not exist',4000,'error');
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
			createPeriodicTag(id,val,callback,'/contenttype/new/'+window.makeNiceName(document.querySelector('#padmin-contenttypes').value)+'/?format=json&limit=200','contenttype');
		}
	}),
	mediafileinput,
	mediafilesresult,
	deleteButton;


var uploadMediaFiles = function(e){
	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files, 
		f,
		updateitemimage = function(mediadoc){
			console.log(mediadoc);
			updatemedia(mediafilesresult,mediadoc);
		};

	// process all File objects
	for (var i = 0; i <files.length; i++) {
		f = files[i];
		// ParseFile(f);
		// uploadFile(f);
		updatemedia.uploadFile(mediafilesresult,f,{
			callback:updateitemimage
		});
	}
};

var deleteItem = function(e) {
	e.preventDefault();
	var eTarget = e.target;
	request
		.post(eTarget.getAttribute('data-href'))
		.set('Accept', 'application/json')
		.send({ 
			_csrf: document.querySelector('input[name=_csrf]').value 
		})
		.query({ format: 'json'})
		.end(function(error, res){
			if(res.error){
				error = res.error;
			}
			if(error || res.status === 500){
				window.ribbonNotification.showRibbon( error.message,4000,'error');
			}
			else{
				if(res.body.result==='error'){
					window.ribbonNotification.showRibbon( res.body.data.error,4000,'error');
				}
				else{
					window.ribbonNotification.showRibbon( res.body.data ,4000,'warn');
				}
			}
	});
};

window.addEventListener('load',function(e){
	tag_lp.init();
	cat_lp.init();
	athr_lp.init();
	cnt_lp.init();
	if(typeof itemtags ==='object'){
		tag_lp.setPreloadDataObject(window.itemtags);
	}
	if(typeof itemcategories ==='object'){
		cat_lp.setPreloadDataObject(window.itemcategories);
	}
	if(typeof itemauthors ==='object'){
		athr_lp.setPreloadDataObject(window.itemauthors);
	}
	if(typeof itemcontenttypes ==='object'){
		cnt_lp.setPreloadDataObject(window.itemcontenttypes);
	}
	window.ajaxFormEventListers('._pea-ajax-form');
	wysihtml5Editor = new window.wysihtml5.Editor('wysihtml5-textarea', { 
		// id of textarea element
		toolbar:      'wysihtml5-toolbar', // id of toolbar element
		parserRules:  window.wysihtml5ParserRules // defined in parser rules set 
	});
	mediafileinput = document.getElementById('padmin-mediafiles');
	mediafilesresult = document.getElementById('media-files-result');
	mediafileinput.addEventListener('change',uploadMediaFiles,false);
	mediafilesresult.addEventListener('click',updatemedia.handleMediaButtonClick,false);	
	deleteButton = document.getElementById('delete-item');
	if(deleteButton){
		deleteButton.addEventListener('click',deleteItem,false);
	}
});

window.updateContentTypes = function(AjaxDataResponse){
	// console.log("runing post update");
	var contenttypeContainer = document.getElementById('doc-ct-attr'),
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