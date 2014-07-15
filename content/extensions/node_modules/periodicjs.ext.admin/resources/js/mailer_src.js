'use strict';

var request = require('superagent'),
	letterpress = require('letterpressjs'),
	updatemedia = require('./updatemedia'),
	wysihtml5Editor,
	mediafileinput,
	mediafilesresult;

window.addEventListener("load",function(e){

	ajaxFormEventListers("._pea-ajax-form");
	wysihtml5Editor = new wysihtml5.Editor("wysihtml5-textarea", { 
		// id of textarea element
		toolbar:      "wysihtml5-toolbar", // id of toolbar element
		parserRules:  wysihtml5ParserRules // defined in parser rules set 
	});
	// mediafileinput = document.getElementById("padmin-mediafiles");
	// mediafilesresult = document.getElementById("media-files-result");
	// mediafileinput.addEventListener("change",uploadMediaFiles,false);
	// mediafilesresult.addEventListener("click",updatemedia.handleMediaButtonClick,false);
});

var uploadMediaFiles = function(e){
	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// process all File objects
	for (var i = 0, f; f = files[i]; i++) {
		// ParseFile(f);
		// uploadFile(f);
		updatemedia.uploadFile(mediafilesresult,f);
	}
};