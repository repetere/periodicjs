'use strict';
var detectcss = require('detectcss'),
	classie = require('classie'),
	componentfullwidthslideshow = require('periodicjs.component.full-width-slideshow'),
	mobilecheck = require('./ismobile'),
	ajaxForm = require('./ajaxform'),
	container,
	triggerBttn,
	searchResultTitle,
	searchResultSection,
	contentSearchInput,
	// assetInfoButton,
	autoSubmitElements,
	assetSlideshows,
	AssetfullWidthSlideshows = [],
	isSearching = false,
	overlay,
	closeBttn,
	transEndEventNames = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'msTransition': 'MSTransitionEnd',
		'transition': 'transitionend'
	},
	transEndEventName = transEndEventNames[detectcss.prefixed('transition')],
	support = {
		transitions: detectcss.feature('transition')
	},
	titleElement,
	docElem = window.document.documentElement,
	support = detectcss.feature('transition'), // support transitions
	docscroll = 0,
	showMenu,
	perspectiveWrapper,
	container,
	contentWrapper,
	clickevent = false; // click event (if mobile use touchstart)

var preventFormSubmit = function (e) {
	e.preventDefault();
	return false;
};

var ajaxFormEventListers = function (selector) {
	var ajaxforms = document.querySelectorAll(selector);
	for (var x in ajaxforms) {
		if (typeof ajaxforms[x] === 'object') {
			// console.log(new FormData(ajaxforms[x]));
			ajaxforms[x].addEventListener('submit', ajaxForm.get, false);
			ajaxforms[x].addEventListener('submit', preventFormSubmit, false);
		}
	}
};

var removeTitle = function () {
	classie.remove(titleElement, 'showtitle');
};

var toggleOverlay = function () {
	if (classie.has(overlay, 'open')) {
		classie.remove(overlay, 'open');
		classie.remove(container, 'overlay-open');
		classie.add(overlay, 'close');
		var onEndTransitionFn = function (ev) {
			if (support.transitions) {
				if (ev.propertyName !== 'visibility') {
					return;
				}
				this.removeEventListener(transEndEventName, onEndTransitionFn);
			}
			classie.remove(overlay, 'close');
		};
		if (support.transitions) {
			overlay.addEventListener(transEndEventName, onEndTransitionFn);
		}
		else {
			onEndTransitionFn();
		}
	}
	else if (!classie.has(overlay, 'close')) {
		classie.add(overlay, 'open');
		classie.add(container, 'overlay-open');
	}
};

var scrollY = function () {
	return window.pageYOffset || docElem.scrollTop;
};

var showNavMenu = function (ev) {
	ev.stopPropagation();
	ev.preventDefault();

	if (classie.has(perspectiveWrapper, 'modalview')) {
		hideNavMenu(ev);
	}
	else {
		docscroll = scrollY();
		// change top of contentWrapper
		contentWrapper.style.top = docscroll * -1 + 'px';
		// mac chrome issue:
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		// add modalview class
		classie.add(perspectiveWrapper, 'modalview');
		// animate..
		setTimeout(function () {
			classie.add(perspectiveWrapper, 'animate');
		}, 25);
	}
};

var hideNavMenu = function () {
	if (classie.has(perspectiveWrapper, 'animate')) {
		var onEndTransFn = function (ev) {
			if (support && (ev.target.className !== 'container' || ev.propertyName.indexOf('transform') === -1)) {
				return;
			}
			this.removeEventListener(transEndEventName, onEndTransFn);
			classie.remove(perspectiveWrapper, 'modalview');
			// mac chrome issue:
			document.body.scrollTop = document.documentElement.scrollTop = docscroll;
			// change top of contentWrapper
			contentWrapper.style.top = '0px';
		};
		if (support) {
			perspectiveWrapper.addEventListener(transEndEventName, onEndTransFn);
		}
		else {
			onEndTransFn.call();
		}
		classie.remove(perspectiveWrapper, 'animate');
	}
};

var autoSubmitFormHandler = function (e) {
	var formElement = this.form;
	if (classie.hasClass(formElement, '_pea-ajax-form')) {
		ajaxForm.get(e, formElement);
	}
	else {
		formElement.submit();
	}
};

var init = function () {
	var t;
	showMenu = document.getElementById('showMenu');
	perspectiveWrapper = document.getElementById('perspective');
	container = perspectiveWrapper.querySelector('.container');
	contentWrapper = container.querySelector('.wrapper');
	clickevent = mobilecheck() ? 'touchstart' : 'click'; // click event (if mobile use touchstart)

	showMenu.addEventListener(clickevent, showNavMenu, false);

	container.addEventListener(clickevent, hideNavMenu, false);

	perspectiveWrapper.addEventListener(clickevent, function () {
		return false;
	});

	t = setTimeout(removeTitle, 2000);

	if (assetSlideshows) {
		for (var e = 0; e < assetSlideshows.length; e++) {
			AssetfullWidthSlideshows.push(new componentfullwidthslideshow({
				element: assetSlideshows[e]
			}));
		}
	}

	if (autoSubmitElements && autoSubmitElements.length > 0) {
		for (var x = 0; x < autoSubmitElements.length; x++) {
			autoSubmitElements[x].addEventListener('change', autoSubmitFormHandler, false);
		}
	}
};

// var toggleAssetOverview = function () {
// 	classie.toggle(assetSlideshow, 'hover-effect');
// };

window.ajaxSearchError = function (errorData) {
	searchResultTitle.innerHTML = 'Search Result for: "' + contentSearchInput.value + '"';
	searchResultSection.innerHTML = JSON.stringify(errorData, null, 2);
};

window.ajaxSearchResult = function (successData, isSearchingStatus) {
	var searchHtml = '';
	isSearching = isSearchingStatus;
	searchResultTitle.innerHTML = 'Search Result for: "' + contentSearchInput.value + '"';
	searchResultSection.innerHTML = ' ';
	if (successData.docs && successData.docs.length > 0) {
		successData.docs.forEach(function (searchresult, index) {
			searchHtml += ' <li>' + (index + 1) + ') ' + '<a href="/' + searchresult.entitytype + '/' + searchresult.name + '">' + searchresult.title + '</a></li> ';
		});
		searchResultSection.innerHTML = '<ol>' + searchHtml + '</ol>';
	}
	else {
		searchResultSection.innerHTML = 'no content found';
	}
};

window.addEventListener('load', function () {
	titleElement = document.querySelector('nav .title');
	container = document.querySelector('div.container');
	triggerBttn = document.getElementById('trigger-overlay');
	overlay = document.querySelector('div.overlay');
	closeBttn = overlay.querySelector('button.overlay-close');
	contentSearchInput = document.querySelector('#contentSearchInput');
	searchResultTitle = document.querySelector('#searchResultTitle');
	searchResultSection = document.querySelector('#searchResultSection');
	assetSlideshows = document.querySelectorAll('.content_assets');
	autoSubmitElements = document.querySelectorAll('.autoFormSubmit');
	// assetInfoButton = document.querySelector('#assetInfoButton');

	ajaxFormEventListers('.reader_ajax_form');

	// assetInfoButton.addEventListener('click', toggleAssetOverview);
	triggerBttn.addEventListener('click', toggleOverlay);
	closeBttn.addEventListener('click', toggleOverlay);
	init();
});
