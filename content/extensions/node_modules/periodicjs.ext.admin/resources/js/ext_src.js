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
	searchExtInput.addEventListener("keypress",searchInputKeypress,false);
	searchExtButton.addEventListener("click",searchExtFromGithub,false);
	searchGithubResultsTable.addEventListener("click",searchTblClick,false);
	extModal.addEventListener("click",extmodalClick,false);
});

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
		returnhtml+='<tr><td>'+repoinfo.name+'</td><td>'+repoinfo.description+'</br> <small><a target="_blank" href="'+repoinfo.html_url+'">'+repoinfo.html_url+'</a></small></td><td>';
		returnhtml+='<a href="#view/'+repoinfo.full_name+'" class="view-ext" data-gitname="'+repoinfo.full_name+'" data-exttitle="'+repoinfo.name+'" data-desc="'+repoinfo.description+'">install</a></td></tr>';
	}
	return returnhtml;
};

var searchTblClick = function(e){
	var eTarget = e.target,
		fullreponame,
		repoversionlist;


	if(eTarget.getAttribute("class")==='view-ext'){
		// console.log("pop modal");
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

var getConsoleOutput = function(responsebody,fullrepo){
	var t = setInterval(function(){
			getOutputFromFile(responsebody.data.repo,responsebody.data.time);
		},4000),
		otf,
		cnt=0,
		lastres='';
	consoleOutput.innerHTML='';

	var getOutputFromFile = function(repo,time){
		request
			.get('/p-admin/extension/install/log/'+repo+'/'+time)
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
								installedExt.innerHTML='<td><a href="/p-admin/extensions/view/'+fullrepo+'">'+fullrepo+'</a></td>'+'<td></td>'+'<td></td>'+'<td></td>'+'<td></td>';
								installedtablebody.appendChild(installedExt);
							}
							else{
								console.log("already installed");
							}
						}
						clearTimeout(t);
					}
					lastres=res.text;
					cnt++;
				}
			});
	}	
};