'use strict';

var letterpress = require('letterpressjs'),
	request = require('superagent'),
	privileges_lp = new letterpress({
		idSelector : '#padmin-privileges',
		sourcedata: '/userprivileges/search.json',
		sourcearrayname: 'userprivileges',
		valueLabel: 'name',
		disablenewtags: true,
		createTagFunc:function(id,val,callback){			
			if(id==='NEWTAG' || id==='SELECT'){
				window.ribbonNotification.showRibbon( 'privilege does not exist',4000,'error');
			}
			else if(id!=='SELECT'||id!=='NEWTAG'){
				callback(id,val);
			}
		}
	}),
	deleteButton;

var deleteUserRole = function(e) {
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
					// var assetid = eTarget.getAttribute("assetid");
					// var assettr = document.querySelector('[data-tr-assetid="'+assetid+'"]');
					// removeTableRow(assettr);
				}
			}
	});
};

window.addEventListener('load',function(){
	privileges_lp.init();
	deleteButton = document.getElementById('delete-userrole');
	if(typeof window.userroleprivileges ==='object'){
		privileges_lp.setPreloadDataObject(window.userroleprivileges);
	}
	window.ajaxFormEventListers('._pea-ajax-form');
	if(deleteButton){
		deleteButton.addEventListener('click',deleteUserRole,false);
	}
});