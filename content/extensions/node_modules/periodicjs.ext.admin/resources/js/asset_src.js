'use strict';

var request = require('superagent'),
	updatemedia = require('./updatemedia'),
	assetTable;

window.addEventListener("load",function(e){
	ajaxFormEventListers("._pea-ajax-form");
	// wysihtml5Editor = new wysihtml5.Editor("wysihtml5-textarea", { 
	// 	// id of textarea element
	// 	toolbar:      "wysihtml5-toolbar", // id of toolbar element
	// 	parserRules:  wysihtml5ParserRules // defined in parser rules set 
	// });
	assetTable = document.getElementById("pea-asset-admin");
	if(assetTable){
		assetTable.addEventListener("click",assetTableClick,false);		
	}
});

var assetTableClick = function(e){
	var eTarget = e.target;
	if(eTarget.getAttribute("class") && eTarget.getAttribute("class").match("delete-asset-button")){
		request
			.post(eTarget.getAttribute("data-href"))
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
					ribbonNotification.showRibbon( error.message,4000,'error');
				}
				else{
					if(res.body.result==='error'){
						ribbonNotification.showRibbon( res.body.data.error,4000,'error');
					}
					else{
						ribbonNotification.showRibbon( res.body.data ,4000,'warn');
						var assetid = eTarget.getAttribute("assetid");
						var assettr = document.querySelector('[data-tr-assetid="'+assetid+'"]');
						removeTableRow(assettr);
					}
				}
		});
	}
};

var removeTableRow = function(element){
	element.parentElement.removeChild(element);
};
