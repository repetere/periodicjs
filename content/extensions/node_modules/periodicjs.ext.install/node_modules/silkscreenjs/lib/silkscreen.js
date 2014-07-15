/*
 * silkscreen
 * http://github.com/typesettin/silkscreen
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var classie = require('classie'),
	extend = require('util-extend'),
	events = require('events'),
	util = require('util');

/**
 * A module that represents a silkscreen.
 * @{@link https://github.com/typesettin/silkscreen}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module silkscreen
 * @requires module:classie
 * @requires module:util-extent
 * @requires module:util
 * @requires module:events
 * @todo to do later
 */
var silkscreen = function(config_options,show,hideOverlay,callback){
	/** module default configuration */
	// console.log("silkscreen");
	var options,
		defaults = {
			idSelector : '_slks_modal',
			title : '',
			message : 'silkscreen',
			element : null,
			type : "",
			effect : 14
		},
		container;

	//extend default options
	options = extend( defaults,config_options );


	/** Returns the configuration object 
	 * @return {object} the module configuration
	 */
	this.config = function(){
		return options;
	};

	/** 
	 * The element to clone in child window
	 * @param {object} element - html element to clone
	 */
	this.setSilkscreenContentElement = function(element){
		options.element = element;
	};

	/**
	 * intialize a new platter
	 */
	this.init = function(show,hideOverlay,callback){
		console.log("show",show);
		this.createOverlay();
		this.createSilkscreen(options.idSelector);
		options.element.addEventListener('click',silkscreenClickEventHandler,false);
		if(show){
			this.showSilkscreen(options.title,options.message,options.effect,options.type,hideOverlay,callback);
		}
	}.bind(this);

	this.setSilkscreenMessage = function(msg){
		if(typeof msg ==='object'){
			options.element.querySelector('._slks-msg').innerHTML='';
			options.element.querySelector('._slks-msg').appendChild(msg);
		}
		else{
			options.element.querySelector('._slks-msg').innerHTML=msg;
		}
	};


	this.setSilkscreenTitle = function(title){
		options.element.querySelector('h3').innerHTML=title;
	};

	/**
	 * create silkscreen html overlay
	 */
	this.createOverlay = function(){
		if(document.getElementById("_slks-container")){
			this.emit("silkscreenContainerCreated",false);
		}
		else{
			var silkscreenModalContainer = document.createElement('div');
			silkscreenModalContainer.setAttribute("id","_slks-container");
			document.body.appendChild(silkscreenModalContainer);
			this.emit("silkscreenModalContainerCreated",silkscreenModalContainer);
		}

		if(document.getElementById("_slks-overlay")){
			this.emit("silkscreenOverlayCreated",false);
		}
		else{
			var silkscreenContainer = document.createElement('div');
			silkscreenContainer.setAttribute("id","_slks-overlay");
			document.body.appendChild(silkscreenContainer);
			this.emit("silkscreenOverlayCreated",silkscreenContainer);
		}
	};
	/**
	 * create silkscreen html
	 * @param {string} id name for platter selector id
	 */
	this.createSilkscreen = function(id){
		var silkscreenHTML = (document.getElementById(id)) ? document.getElementById(id) : document.createElement('div');
		/** create platter tab html */
		classie.addClass(silkscreenHTML,'_slks-modal');
		classie.addClass(silkscreenHTML,'_slks');
		classie.addClass(silkscreenHTML,'_slks-effect-'+options.effect);
		silkscreenHTML.id = id;

		var silkscreenContent = document.createElement('div');
		classie.addClass( silkscreenContent , "_slks-content");

		silkscreenContent.innerHTML ='<h3>'+options.title+"</h3>";

		var silkscreenContentHTML = document.createElement('div');
		if(options.message){
			silkscreenContentHTML.innerHTML ='<div class="_slks-msg">'+options.message+'</div>';
		}
		else{
			silkscreenContentHTML.innerHTML ='<div class="_slks-msg">'+silkscreenHTML.innerHTML+'</div>';
		}
		// empty div
		silkscreenHTML.innerHTML='';

		/** add close button to modal div html */
		var silkscreenCloseBottom = document.createElement('button');
		classie.addClass( silkscreenCloseBottom , "_slks-close");
		silkscreenCloseBottom.innerHTML = 'Close';

		silkscreenContentHTML.appendChild(silkscreenCloseBottom);
		/** add conent to modal div */
		silkscreenContent.appendChild(silkscreenContentHTML);
		/** add modal to modal container */
		silkscreenHTML.appendChild(silkscreenContent);
		document.querySelector('#_slks-container').appendChild(silkscreenHTML);
		options.element = document.getElementById(options.idSelector);
		this.emit("silkscreenCreated",true);
	};
	/** hides platter in bar */
	this.hideSilkscreen = function(){
		classie.removeClass(options.element.querySelector('._slks-content'),'_slks-type-'+options.type);
		classie.removeClass(options.element,'_slks-effect-'+options.effect);
		classie.removeClass(options.element,'_slks-show');
		classie.removeClass(document.getElementById("_slks-overlay"),'_slks-type-'+options.type);
		classie.removeClass(document.getElementById("_slks-overlay"),'_slks-show-overlay');
		this.emit("silkscreenClosed",true);
	};

	/** show platter in bar */
	this.showSilkscreen = function(title,message,effect,type,hideOverlay,callback){
		// console.log("msg",msg,"timed",timed,"type",type,"callback",callback);
		if(title){
			this.setSilkscreenTitle(title);
		}
		if(message){
			this.setSilkscreenMessage(message);
		}
		options.effect = effect;
		classie.addClass(options.element,'_slks-effect-'+effect);

		options.type = type;
		classie.addClass(options.element.querySelector('._slks-content'),'_slks-type-'+type);
		classie.addClass(document.getElementById("_slks-overlay"),'_slks-type-'+type);
		var t = setTimeout(function(){
			classie.addClass(options.element,'_slks-show');
			clearTimeout(t);
		},100);
		if(!hideOverlay){
			classie.addClass(document.getElementById("_slks-overlay"),'_slks-show-overlay');
		}
		callCallBack(callback);
		this.emit("silkscreenOpened",true);
	}.bind(this);

	var silkscreenClickEventHandler = function(e){
		var etarget = e.target;
		if(classie.hasClass(etarget,'_slks-close')){
			this.hideSilkscreen();
		}
	}.bind(this);

	this.init(show,hideOverlay,callback);
	function callCallBack(callback){
		if(typeof callback ==='function'){
			callback();
		}
	}
};

util.inherits(silkscreen,events.EventEmitter);

module.exports = silkscreen;

// If there is a window object, that at least has a document property,
// define linotype
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.silkscreen = silkscreen;
}