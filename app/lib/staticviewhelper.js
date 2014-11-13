/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var querystring = require('querystring');
/**
 * A module that contains view helpers for ejs views.
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module staticViewHelper
 */
module.exports = {
	/** ejs view helper
	 * @exports staticViewHelper/viewhelper
	 * @memberOf staticViewHelper
	 */
	viewhelper: {
		/** helper function that returns the html for a javascript tag
		 * @param {object} scripts either a string or an object/array of file paths
		 * @returns {string} script tag for javascript
		 */
		includeJavaScripts: function (scripts) {
			function scriptTag(scriptsrc) {
				return '<script type="text/javascript" src="' + scriptsrc + '"></script>';
			}

			if (scripts) {
				switch (typeof scripts) {
				case 'array':
				case 'object':
					var scriptHtml = '';
					for (var x in scripts) {
						scriptHtml += scriptTag(scripts[x]);
					}
					return scriptHtml;
					// break;
				case 'string':
					return scriptTag(scripts);
					// break;
				}
			}
		},
		/** helper function exposes a server javascript object to the client
		 * @param {object} obj server object for the client
		 * @param {object} nameOfClientObj name of exposed server object for the client
		 * @returns {string} javascript statement that contains server javascript object
		 */
		passObjToClient: function (obj, nameOfClientObj) {
			return 'var ' + nameOfClientObj + ' = ' + (JSON.stringify(obj));
		},
		/** helper function to get querystring
		 * @param {object} obj of query params
		 * @returns {string} query string
		 */
		getQueryString: function (obj) {
			return querystring.stringify(obj);
		},

		/** helper function that generates html for pagination
		 * @param {object} options view options
		 * @returns {string} html for pagination
		 */
		getPaginationHtml: function (options) {
			var pagecount = options.pagecount,
				urlbase = options.urlbase,
				currentpage = (options.pagenumber) ? options.pagenumber - 1 : false,
				paginationHtml = '<div class="_pea-row _pea-form _pea-container-forminput">';
			paginationHtml += '<div class="_pea-col-span12 _pea-text-right _pea-text-small">';
			paginationHtml += 'pages ';
			for (var x = 0; x < pagecount; x++) {
				paginationHtml += ' <a href="' + urlbase + '/' + (x + 1) + '" class="_pea-button';
				if (currentpage === x) {
					paginationHtml += ' _pea-color-info ';
				}
				paginationHtml += '">' + (x + 1) + '</a>';
			}
			paginationHtml += '</div>';
			paginationHtml += '</div>';
			return paginationHtml;
		},
		/** get injectible html fragments
		 * @exports staticViewHelper/getHTML
		 * @memberOf staticViewHelper
		 */
		getHTML: function(htmlLocalsObject){
			var returnHTML ='';
			if(typeof htmlLocalsObject ==='object'){
				for(var x in htmlLocalsObject){
					returnHTML+='<!-- START['+x+'] -->';
					returnHTML+=htmlLocalsObject[x];
					returnHTML+='<!-- END['+x+'] -->';
				}
			}
			else{
				returnHTML='<!-- not a valid HTML object -->';
			}
			return returnHTML;
		}
	},
	/** theme file path view helpers for ejs
	 * @exports staticViewHelper/themehelper
	 * @memberOf staticViewHelper
	 */
	themehelper: {
		/** helper function to get file paths for extension resources
		 * @param {object} ext name of periodic extension
		 * @param {object} resource file path of extension resource
		 * @returns {string} file path for extension resource
		 */
		extensionPublicResourcePath: function (ext, resource) {
			var addPath = (resource) ? resource + '/' : '';
			return '/extensions/' + ext + '/' + addPath;
		},
		/** helper function to get file paths for theme resources
		 * @param {object} ext name of periodic theme
		 * @param {object} resource file path of theme resource
		 * @returns {string} file path for theme resource
		 */
		themePublicResourcePath: function (ext, resource) {
			var addPath = (resource) ? resource + '/' : '';
			return '/themes/' + ext + '/' + addPath;
		}
	}
};
