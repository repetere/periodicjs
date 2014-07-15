'use strict';
var request = require('superagent');

var updatemedia = function( element, mediadoc ){
	var updateMediaResultHtml = function(element,mediadoc){
		element.appendChild(generateMediaHtml(mediadoc));
	};

	var generateMediaHtml = function(mediadoc){
		var mediaHtml = document.createElement("div"),
			htmlForInnerMedia='';
		mediaHtml.setAttribute("class","_pea-col-span4 media-item-x");
		mediaHtml.setAttribute("data-id",mediadoc._id);
		htmlForInnerMedia+='<input style="display:none;" name="assets" type="checkbox" value="'+mediadoc._id+'" checked="checked"></input>';
		if(mediadoc.assettype.match("image")){
			htmlForInnerMedia+='<img class="_pea-col-span11" src="'+mediadoc.fileurl+'"/>';
		}
		else{
			htmlForInnerMedia+='<div class="_pea-col-span11"> '+mediadoc.fileurl+'</div>';
		}
		htmlForInnerMedia+='<div class="mix-options _pea-text-right">';
		htmlForInnerMedia+='<a data-assetid="'+mediadoc._id+'" title="make primary asset" class="_pea-button make-primary _pea-color-warn">*</a>';
		htmlForInnerMedia+='<a data-assetid="'+mediadoc._id+'" title="remove asset" class="_pea-button remove-asset _pea-color-error">x</a>';
		htmlForInnerMedia+='</div>';
		mediaHtml.innerHTML = htmlForInnerMedia;
		return mediaHtml;
	};

	updateMediaResultHtml(element, mediadoc);
};

updatemedia.handleMediaButtonClick = function(e){
	var eTarget = e.target;
	if(eTarget.getAttribute("class") && eTarget.getAttribute("class").match("remove-asset")){
		document.getElementById("media-files-result").removeChild(eTarget.parentElement.parentElement);
	}
	else if(eTarget.getAttribute("class") && eTarget.getAttribute("class").match("make-primary")){
		document.getElementById("primaryasset-input").value = eTarget.getAttribute("data-assetid");
		var mpbuttons = document.querySelectorAll("._pea-button.make-primary");
		for(var x in mpbuttons){
			if(typeof mpbuttons[x]==="object"){
				mpbuttons[x].style.display="inline-block";
			}
		};
		eTarget.style.display="none";
	}
};

updatemedia.uploadFile = function(mediafilesresult,file,options){
	var reader = new FileReader(),
			client = new XMLHttpRequest(),
			formData = new FormData();
			if(options){
				var posturl = options.posturl,
						callback = options.callback;
			}
			else{
				var posturl = "/mediaasset/new?format=json",
					callback=function(data){
						updatemedia(mediafilesresult,data);
					};
			}

	reader.onload = function(e) {
		// console.log(e);
		// console.log(file);
		formData.append("mediafile",file,file.name);

		client.open("post", posturl, true);
		client.setRequestHeader("x-csrf-token", document.querySelector('input[name=_csrf]').value );
		client.send(formData);  /* Send to server */ 
	}
	reader.readAsDataURL(file);
	client.onreadystatechange = function(){
		if(client.readyState == 4){
			try{
				var res = JSON.parse(client.response);
				if(res.result==='error'){
					ribbonNotification.showRibbon( res.data.error,4000,'error');
				}
				else if(client.status !== 200){
					ribbonNotification.showRibbon( client.status+": "+client.statusText,4000,'error');
				}
				else{
					ribbonNotification.showRibbon("saved",4000,'success');
					callback(res.data.doc);
				}
			}
			catch(e){
				ribbonNotification.showRibbon( e.message,4000,'error');
				console.log(e);
			}
		}
	}
};

module.exports =updatemedia;