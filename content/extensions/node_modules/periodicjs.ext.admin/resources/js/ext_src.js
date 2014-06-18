'use strict';

var request = require('superagent'),
	letterpress = require('letterpressjs'),
	extModal,
	searchExtInput,
	searchExtButton,
	searchGithubResultsTable,
	searchGithubResultsTableBody,
	installedtable,
	installedtablebody,
	hideConsoleOutput,
	consoleOutput;

window.addEventListener("load",function(e){
	searchExtInput = document.getElementById("search-ext_input");
	searchExtButton = document.getElementById("search-ext_button");
	searchGithubResultsTable = document.getElementById("ext-search-results");
	searchGithubResultsTableBody = document.getElementById("ext-search-results-tbody");
	extModal = document.getElementById("view-ext-info-modal");
	consoleOutput = document.getElementById("ext-console-output");
	installedtablebody = document.getElementById("installed-ext-tablebody");
	installedtable = document.getElementById("installed-ext-table");
	hideConsoleOutput = document.getElementById("hide-ext-console");
	searchExtInput.addEventListener("keypress",searchInputKeypress,false);
	searchExtButton.addEventListener("click",searchExtFromGithub,false);
	searchGithubResultsTable.addEventListener("click",searchTblClick,false);
	extModal.addEventListener("click",extmodalClick,false);
	installedtable.addEventListener("click",installedTableClick,false);
	hideConsoleOutput.addEventListener("click",hideConsoleOutputClick,false);
});

var hideConsoleOutputClick = function(e){
	document.getElementById("ext-console").style.display="none";
};

var installedTableClick = function(e){
	var eTarget = e.target;

	if(eTarget.getAttribute("class") && eTarget.getAttribute("class").match("enable-ext-button")){
		request
			.get(eTarget.getAttribute("data-href"))
			.query({format:"json"})
			.set('Accept', 'application/json')
			.end(function(error, res){
				if(error){
					ribbonNotification.showRibbon( error.message,4000,'error');
				}
				else if(res.body.result === "success"){
					if(res.body.data.msg==="extension disabled"){
						ribbonNotification.showRibbon( res.body.data.msg,4000,'warn');
						eTarget.innerHTML='enable';
						eTarget.setAttribute("data-href","/p-admin/extension/"+res.body.data.ext+"/enable");
						eTarget.setAttribute("class","_pea-button  enable-ext-button");
						//<a data-href="/p-admin/extension/<%= extension.name %>/enable" class="_pea-button enable-ext-button">enable</a>		
					}
					else{
						ribbonNotification.showRibbon( res.body.data.msg,4000,'success');
						eTarget.innerHTML='disable';
						eTarget.setAttribute("data-href","/p-admin/extension/"+res.body.data.ext+"/disable");
						eTarget.setAttribute("class","_pea-button _pea-color-warn enable-ext-button");
						//<a data-href="/p-admin/extension/<%= extension.name %>/disable" class="_pea-button _pea-color-warn enable-ext-button">disable</a>				
					}
				}
				else{
					ribbonNotification.showRibbon( res.body.data.error,4000,'error');
				}
			});
	}
	else if(eTarget.getAttribute("class") && eTarget.getAttribute("class").match("delete-ext-button")){
		request
			.post(eTarget.getAttribute("data-href"))
			.query({
				format:"json",
				_csrf:eTarget.getAttribute("data-token")
			})
			.set('Accept', 'application/json')
			.end(function(error, res){
				if(res && res.error){
					error = res.error;
				}
				if(error){
					ribbonNotification.showRibbon( error.message,4000,'error');
				}
				else{
					document.getElementById("ext-console").style.display="block";
					getConsoleOutput(res.body,eTarget.getAttribute("data-extname"),res.body.data.extname,'remove');
				}
			});

	}
};

var searchExtFromGithub = function(){
	searchGithubResultsTableBody.innerHTML = '<tr><td class="_pea-text-center" colspan="3">searching github</td></tr>';

	request
		.get('https://api.github.com/search/repositories')
		.query({q:'periodicjs.ext.'+document.getElementById("search-ext_input").value})
		.set('Accept', 'application/json')
		.end(function(error, res){
			if(error){
				ribbonNotification.showRibbon( error.message,4000,'error');
			}
			else if(!res.body.items){
				ribbonNotification.showRibbon( "could not search github",4000,'error');
			}
			else{
				searchGithubResultsTable.style.display="table";
				searchGithubResultsTableBody.innerHTML = buildSearchExtResultTable(res.body.items);
			}
		});
};

var searchInputKeypress = function(e){
	if ( e.which === 13 || e.keyCode === 13  ) {
		searchExtFromGithub();
	}
};

var buildSearchExtResultTable = function(data){
	var returnhtml = '',repoinfo;
	for(var x in data){
		repoinfo=data[x];
		returnhtml+='<tr><td>'+repoinfo.name+'</td><td>'+repoinfo.description+'</br> <small><a target="_blank" href="'+repoinfo.html_url+'">'+repoinfo.html_url+'</a></small></td><td class="_pea-text-right">';
		returnhtml+='<a href="#view/'+repoinfo.full_name+'" class="view-ext _pea-button" data-gitname="'+repoinfo.full_name+'" data-exttitle="'+repoinfo.name+'" data-desc="'+repoinfo.description+'">install</a></td></tr>';
	}
	return returnhtml;
};

var searchTblClick = function(e){
	var eTarget = e.target,
		fullreponame,
		repoversionlist;

		console.log("search table click");

	if(eTarget.getAttribute("class") && eTarget.getAttribute("class").match('view-ext')){
		console.log("pop modal");
		extModal.querySelector('.title').innerHTML=eTarget.getAttribute("data-exttitle").replace('periodicjs.ext.','');
		extModal.querySelector('.desc').innerHTML=eTarget.getAttribute("data-desc");
		repoversionlist = extModal.querySelector('.versions');
		repoversionlist.innerHTML='<li>loading versions...</li>';
		fullreponame=eTarget.getAttribute("data-gitname");

		silkscreenModal.showSilkscreen('Install Extension',extModal,null,14);

		request
			.get('https://api.github.com/repos/'+fullreponame+'/tags')
			.set('Accept', 'application/json')
			.end(function(error, res){
				if(error){
					ribbonNotification.showRibbon( error.message,4000,'error');
				}
				else{
					extModal.querySelector('.versions').innerHTML='';
					repoversionlist.innerHTML='<li><a class="install-ext-link" data-repo="'+fullreponame+'" data-version="latest">latest</a></li>';
					// console.log(res.body.length,res.body)
					if(res.body.length>0){
						for(var x in res.body){
							repoversionlist.innerHTML+='<li><a class="install-ext-link" data-repo="'+fullreponame+'" data-version="'+res.body[x].name+'">'+res.body[x].name+'</a></li>';
						}
					}
				}
			});
	}
};

var extmodalClick = function(e){
	var eTarget = e.target;
	if(eTarget.getAttribute("class")==='install-ext-link'){
		silkscreenModal.hideSilkscreen();

		request
			.get('/p-admin/extension/install')
			.query({
				name:eTarget.getAttribute("data-repo"),
				version:eTarget.getAttribute("data-version"),
				format:"json"
			})
			.set('Accept', 'application/json')
			.end(function(error, res){
				if(res && res.error){
					error = res.error;
				}
				if(error){
					ribbonNotification.showRibbon( error.message,4000,'error');
				}
				else{
					document.getElementById("ext-console").style.display="block";
					getConsoleOutput(res.body,eTarget.getAttribute("data-repo").split('/')[1]);
				}
			});
	}
};

var getConsoleOutput = function(responsebody,fullrepo,extname,operation){
	var t = setInterval(function(){
			getOutputFromFile(responsebody.data.repo,responsebody.data.time);
		},4000),
		otf,
		cnt=0,
		lastres='',
		repo = responsebody.data.repo,
		time = responsebody.data.time,
		getRequest = (operation === 'remove') ? '/p-admin/extension/remove/log/'+repo+'/'+time : '/p-admin/extension/install/log/'+repo+'/'+time;
	consoleOutput.innerHTML='';

	var getOutputFromFile = function(repo,time){
		request
			.get(getRequest)
			.set('Accept', ' text/plain')
			.end(function(error, res){
				if(res.error){
					error = res.error;
				}

				if(error){
					ribbonNotification.showRibbon( error.message || res.text ,8000,'error');
					// console.log("error in ajax for file log data");
					clearTimeout(t);
				}
				else{
					if(cnt>20){
						console.log("made 20 req stop ajax");
						clearTimeout(t);
					}
					// console.log(cnt);
					// console.log(res.text);
					if(res.text!==lastres){
						otf = document.createElement("div");
						otf.innerHTML=res.text;
						consoleOutput.appendChild(otf);
						consoleOutput.scrollTop=consoleOutput.scrollHeight;
					}
					if(res.text.match('====!!ERROR!!====') || res.text.match('====##END##====')){
						if(res.text.match('====##END##====')){
							ribbonNotification.showRibbon( fullrepo+' installed' ,8000,'success');
							if(!installedtable.innerHTML.match(fullrepo)){
								var installedExt = document.createElement('tr');
								installedExt.innerHTML='<td><a href="/p-admin/extensions/view/'+fullrepo+'">'+fullrepo+'</a></td>'+'<td></td>'+'<td></td>';
								installedtablebody.appendChild(installedExt);
							}
							else{
								console.log("already installed");
							}
							cleanupLogFile(repo,time,'install');
						}
						clearTimeout(t);
					}
					else if(res.text.match('====!!ERROR!!====') || res.text.match('====##REMOVED-END##====')){

						ribbonNotification.showRibbon( fullrepo+' removed' ,4000,'warn');
						var removeExtElement = document.getElementById('tr-ext-'+extname);
						removeExtElement.parentNode.removeChild(removeExtElement);
						cleanupLogFile(repo,time,'remove');
						clearTimeout(t);
					}
					lastres=res.text;
					cnt++;
				}
			});
	}

	var cleanupLogFile = function(repo,time,mode){
		request
			.get('/p-admin/extension/cleanup/log/'+repo+'/'+time)
			.query({
				format:"json",
				mode:mode
			})
			.set('Accept', ' application/json')
			.end(function(error,res){
				if(res.error){
					error = res.error;
				}

				if(error){
					ribbonNotification.showRibbon( error.message || res.text ,8000,'error');
				}
			});
	}
};