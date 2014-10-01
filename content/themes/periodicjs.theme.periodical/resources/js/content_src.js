'use strict';

var classie = require('classie'),
	periodicalTheme = require('./periodical.theme'),
	theme = new periodicalTheme(),
	// disable/enable scroll (mousewheel and keys) from http://stackoverflow.com/a/4770179					
	// left: 37, up: 38, right: 39, down: 40,
	// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
	docElem = window.document.documentElement,
	scrollVal,
	isRevealed,
	noscroll,
	container,
	trigger,
	Linotype = require('linotypejs'),
	LinotypeCollection,
	linotypeelement;

var scrollY = function () {
	return window.pageYOffset || docElem.scrollTop;
};

var toggle = function (reveal) {

	if (container) {
		if (reveal) {
			classie.add(container, 'modify');

		}
		else {
			classie.remove(container, 'modify');
		}
	}
};

var scrollPage = function () {
	if (container) {
		scrollVal = scrollY();

		if (scrollVal < 5) {
			classie.remove(container, 'modify');
		}
		else {
			classie.add(container, 'modify');
		}
	}
};

window.addEventListener('scroll', scrollPage, false);

window.addEventListener('load', function () {

	//items
	container = document.getElementById('container');
	if (container) {
		trigger = container.querySelector('button.trigger');
		// refreshing the page...
		var pageScroll = scrollY();
		noscroll = pageScroll === 0;

		console.log('pageScroll', pageScroll);
		if (pageScroll) {
			isRevealed = true;
			classie.add(container, 'modify');
		}

		trigger.addEventListener('click', function () {
			toggle('reveal');
		});
	}
	//collections
	linotypeelement = document.getElementById('linotype');
	if (linotypeelement) {
		LinotypeCollection = new Linotype({
			easing: true,
		});
	}
	window.LinotypeCollection = LinotypeCollection;

}, false);
