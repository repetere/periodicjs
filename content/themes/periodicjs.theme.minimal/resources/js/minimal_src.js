'use strict';

var componentfullwidthslideshow = require('periodicjs.component.full-width-slideshow'),
	assetSlideshows,
	AssetfullWidthSlideshows = [],
	init = function () {
		if (assetSlideshows) {
			for (var e = 0; e < assetSlideshows.length; e++) {
				AssetfullWidthSlideshows.push(new componentfullwidthslideshow({
					element: assetSlideshows[e]
				}));
			}
		}
	};

window.addEventListener('load', function () {
	assetSlideshows = document.querySelectorAll('.content_assets');
	init();
});
