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
		}
	},
	themehelper:{
		extensionPublicResourcePath : function(ext,resource){
			var addPath = (resource)? resource+'/' : '';
			return '/extensions/'+ext+'/'+addPath;
		}
	}
};