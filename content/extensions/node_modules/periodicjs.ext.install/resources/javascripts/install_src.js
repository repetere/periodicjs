'use strict';

var ajaxform = require('./ajaxform'),
		request = require('superagent'),
		ribbon = require('ribbonjs'),
		silkscreen = require('silkscreenjs'),
		installadmin,
		installform,
		consoleOutput;

window.addEventListener("load",function(){
	window.silkscreenModal = new silkscreen(),
	window.ribbonNotification = new ribbon({type:"info",idSelector:"#_pea_ribbon-element"});
	installadmin = document.getElementById("install-admin-select");
	installform = document.getElementById("install_form");
	consoleOutput = document.getElementById("install-console-output");
	ajaxform.preventEnterSubmitListeners();
	ajaxform.ajaxFormEventListers('._pea-ajaxforms',window.ribbonNotification);
	installadmin.addEventListener("change",showadminoptions,false);
	installform.addEventListener("click",installformclick,false);
});

var showadminoptions = function(e){
	var eTarget = e.target;
	if(eTarget.value==="true"){
		document.getElementById("admin-install-info").style.display="block";
	}
	else{
		document.getElementById("admin-install-info").style.display="none";
	}
};

var installformclick = function(e){
	var eTarget = e.target;
	if(eTarget.getAttribute("class") && eTarget.getAttribute("class").match("pop-tooltip")){
		var modalelement = document.getElementById(eTarget.getAttribute("data-id"));
		silkscreenModal.showSilkscreen(modalelement.getAttribute("data-title"),modalelement,14,"default");
	}
};

var getConsoleOutput = function(){
	var t = setInterval(function(){
				getOutputFromFile();
			},2000),
			otf,
			cnt=0,
			lastres='outputlog',
			getRequest = '/install/getlog';
	consoleOutput.innerHTML='';

	var getOutputFromFile = function(){
		request
			.get(getRequest)
			.set('Accept', ' text/plain')
			.end(function(error, res){
				// console.log("made request",cnt, error,res);

				if(res && res.error){
					ribbonNotification.showRibbon( res.error.message || res.text ,8000,'error');
					// console.log("error in ajax for file log data");
					console.log("cnt",cnt);
					console.log("res",res);
					if(res.error || cnt >5){
						clearTimeout(t);
					}
				}
				if(error){
					ribbonNotification.showRibbon( error.message || res.text ,8000,'error');
					// console.log("error in ajax for file log data");
					console.log("cnt",cnt);
					console.log("res",res);
					if(res.error || cnt >5){
						clearTimeout(t);
					}
				}
				else{
					if(cnt>30){
						console.log("made 20 req stop ajax");
						clearTimeout(t);
					}
					// console.log(cnt);
					// console.log(res.text);
					if(res.text!==lastres){
						otf = document.createElement("pre");
						otf.innerHTML=res.text;
						consoleOutput.appendChild(otf);
						consoleOutput.scrollTop=consoleOutput.scrollHeight;
					}
					
					if(res.text.match('====##CONFIGURED##====')){
						ribbonNotification.showRibbon( 'installed, refresh window to get started' ,false,'success');
						silkscreenModal.showSilkscreen('Install Complete',"Lets get <a href='"+window.location.href+"'>started</a>. "+errortext,14,"success");
						clearTimeout(t);
					}
					else if(res.text.match('====!!ERROR!!====') || res.text.match('====##REMOVED-END##====')){
						// console.error("there was an error in installing periodic");
						console.log("res",res);
						var errortext = res.error.message || '';
						silkscreenModal.showSilkscreen('Install error',"there was an error in installing periodic. "+errortext,14,"error");
						ribbonNotification.showRibbon(' there was an error in installing periodic' ,4000,'warn');
						clearTimeout(t);
					}
					lastres=res.text;
					cnt++;
				}
			});
	}
};


window.successFormPost = function(resdata){
	// console.log("resdata",resdata);
	document.getElementById("install-console").style.display="block";
	getConsoleOutput();
	ribbonNotification.showRibbon( 'beginning installation' ,4000,'info');
};