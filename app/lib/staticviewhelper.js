/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';


module.exports = {
	viewhelper:{
		includeJavaScripts : function(scripts){
			function scriptTag(scriptsrc){
				return '<script type="text/javascript" src="'+scriptsrc+'"></script>';
			}

			if(scripts){
				switch (typeof scripts){
					case 'array':
					case 'object':
						var scriptHtml="";
						for( var x in scripts){
							scriptHtml+=scriptTag(scripts[x]);
						}
						return scriptHtml;
						// break;
					case 'string':
						return scriptTag(scripts);
						// break;
				}
			}
		},
		passObjToClient : function(obj,nameOfClientObj){
			return "var "+nameOfClientObj+" = "+(JSON.stringify(obj));
		},
		getPaginationHtml : function(options){
			var pagecount = options.pagecount,
					urlbase = options.urlbase,
					currentpage = (options.pagenumber)? options.pagenumber - 1 : false,
					paginationHtml = '<div class="_pea-row _pea-form _pea-container-forminput">';
			paginationHtml += '<div class="_pea-col-span12 _pea-text-right _pea-text-small">';
			paginationHtml += 'pages ';
			for(var x=0;x<pagecount;x++){
				paginationHtml += ' <a href="'+urlbase+'/'+(x+1)+'" class="_pea-button';
				if( currentpage === x ){
					paginationHtml += " _pea-color-info ";
				}
				paginationHtml += '">'+(x+1)+'</a>';
			}
			paginationHtml += '</div>';
			paginationHtml += '</div>';
			return paginationHtml;
		}
	},
	themehelper:{
		extensionPublicResourcePath : function(ext,resource){
			var addPath = (resource)? resource+'/' : '';
			return '/extensions/'+ext+'/'+addPath;
		}
	}
};