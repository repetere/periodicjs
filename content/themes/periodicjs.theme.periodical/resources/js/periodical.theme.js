'use strict';

var navigationHeader = require('periodicjs.theme-component.navigation-header'),
	classie = require('classie'),
	periodicalNavigation,
	navScrollElementTransition,
	navElement;

var lazyloadBackgroundMedia = function (backgroundMedia) {
	classie.removeClass(backgroundMedia, 'lazyload');
};

var sizeAndPositionBackgroundMedia = function (backgroundMedia) {
	var mediaWidth = backgroundMedia.clientWidth,
		mediaHeight = backgroundMedia.clientHeight,
		windowWidth = window.innerWidth,
		windowHeight = window.innerHeight,
		widthDifference = mediaWidth / windowWidth,
		heightDifference = mediaHeight / windowHeight;
	// console.log('backgroundMedia', backgroundMedia, mediaWidth, mediaHeight, windowWidth, windowHeight, 'widthDifference', widthDifference, 'heightDifference', heightDifference);
	console.log('resize');

	if (widthDifference < heightDifference) {
		var heightOffset = ((mediaHeight / widthDifference) - windowHeight) / 2 * -1;
		if (widthDifference < 1) {
			heightOffset = ((mediaHeight / widthDifference) / 2) * -1;
		}
		backgroundMedia.style.width = '100%';
		backgroundMedia.style.height = 'auto';
		backgroundMedia.style['margin-top'] = heightOffset + 'px';
	}
	else {
		var widthOffset = ((mediaWidth / heightDifference) - windowWidth) / 2 * -1;
		if (heightDifference < 1) {
			widthOffset = ((mediaWidth / heightDifference) / 2) * -1;
		}
		backgroundMedia.style.height = '100%';
		backgroundMedia.style.width = 'auto';
		backgroundMedia.style['margin-left'] = widthOffset + 'px';
	}
	if (classie.hasClass(backgroundMedia, 'lazyload')) {
		lazyloadBackgroundMedia(backgroundMedia);
	}
};

var scrollListener = function () {
	if (navScrollElementTransition && navElement && window.pageYOffset > 5) {
		classie.remove(navElement, 'transparent');
	}
	else if (navScrollElementTransition && navElement && window.pageYOffset < 5) {
		classie.add(navElement, 'transparent');
	}
};

var periodicaltheme = function () {
	window.addEventListener('load', function () {
		periodicalNavigation = new navigationHeader({
			idSelector: 'ha-header',
			navStyle: 1,
			subNavStyle: 4
		});
		window.periodicalthemenavigation = periodicalNavigation;
		navElement = document.getElementById('ha-header');
		navScrollElementTransition = (typeof window.useNavTransparency === 'undefined' || window.useNavTransparency === true) ? true : false;
		scrollListener();
	}, false);

	window.addEventListener('scroll', scrollListener, false);
	return {
		navigation: periodicalNavigation,
		sizeAndPositionBackgroundMedia: sizeAndPositionBackgroundMedia,
		lazyloadBackgroundMedia: lazyloadBackgroundMedia
	};
};

module.exports = periodicaltheme;
