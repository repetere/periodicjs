'use strict';

var letterpress = require('letterpressjs'),
	request = require('superagent'),
	updatemedia = require('./updatemedia'),
	roles_lp = new letterpress({
		idSelector : '#padmin-userroles',
		sourcedata: '/userroles/search.json',
		sourcearrayname: 'userroles',
		valueLabel: 'name',
		disablenewtags: true,
		createTagFunc:function(id,val,callback){			
			if(id==='NEWTAG' || id==='SELECT'){
				window.ribbonNotification.showRibbon( 'role does not exist',4000,'error');
			}
			else if(id!=='SELECT'||id!=='NEWTAG'){
				callback(id,val);
			}
		}
	}),
	deleteButton,
	mediafileinput,
	mediafilesresult;

var deleteUser = function(e) {
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
					// var assetid = eTarget.getAttribute('assetid');
					// var assettr = document.querySelector('[data-tr-assetid="'+assetid+'"]');
					// removeTableRow(assettr);
				}
			}
	});
};

var uploadMediaFiles = function(e){
	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files, 
		f,
		updateuserpic = function(mediadoc){
			console.log(mediadoc);
			updatemedia(mediafilesresult,mediadoc);
		};

	// process all File objects
	for (var i = 0; i <files.length; i++) {
		f = files[i];
		// ParseFile(f);
		// uploadFile(f);
		updatemedia.uploadFile(mediafilesresult,f,{
			callback:updateuserpic
		});
	}
};

window.addEventListener('load',function(){
	if(document.querySelector('#padmin-userroles')){
		roles_lp.init();
		if(typeof window.userprofileuseroles ==='object'){
			roles_lp.setPreloadDataObject(window.userprofileuseroles);
		}
	}
	deleteButton = document.getElementById('delete-user');
	window.ajaxFormEventListers('._pea-ajax-form');
	if(deleteButton){
		deleteButton.addEventListener('click',deleteUser,false);
	}
	mediafileinput = document.getElementById('padmin-mediafiles');
	mediafilesresult = document.getElementById('media-files-result');
	mediafileinput.addEventListener('change',uploadMediaFiles,false);
	mediafilesresult.addEventListener('click',updatemedia.handleMediaButtonClick,false);
});