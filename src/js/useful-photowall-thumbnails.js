/*
	Source:
	van Creij, Maurice (2014). "useful.photowall.js: Simple photo wall", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photowall = useful.Photowall || function () {};

// extend the constructor
useful.Photowall.prototype.Thumbnails = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.complete = function () {
		var a, b, passed = true, parent = this.parent, config = this.config;
		// for all the images
		for (a = 0 , b = config.images.objects.length; a < b; a += 1) {
			// if any of the images doesn't have a valid height
			passed = passed && config.images.objects[a].offsetWidth > 2;
		}
		// return the result
		return passed;
	};

	this.measure = function () {
		var parent = this.parent, config = this.config, a, b;
		// for all images
		config.images.widths = [];
		config.images.heights = [];
		config.images.aspects = [];
		for (a = 0 , b = config.images.objects.length; a < b; a += 1) {
			// get its dimensions
			config.images.widths[a] = config.images.objects[a].offsetWidth;
			config.images.heights[a] = config.images.objects[a].offsetHeight;
			config.images.aspects[a] = config.images.heights[a] / config.images.widths[a];
		}
	};

	this.redraw = function () {
		var parent = this.parent, config = this.config,
			a, b, last, c, d, compatibilityWidth, proportionalWidth, subtotalWidth = 0, currentRow = [],
			hasLinks = (config.images.links.length === config.images.objects.length);
		// for every image
		for (a = 0 , b = config.images.objects.length, last = b - 1; a < b; a += 1) {
			// calculate its width proportional to the given row height
			proportionalWidth = config.row / config.images.aspects[a];
			subtotalWidth += proportionalWidth;
			// add it to a subtotal array with the image and dimensions
			currentRow.push({
				'link' : config.images.links[a],
				'object' : config.images.objects[a],
				'proportionalWidth' : proportionalWidth
			});
			// if the subtotal exceeds a row's width
			if (subtotalWidth >= config.col || a === last) {
				// if the last image sticks out too far, discard it
			//	if (subtotalWidth - config.col > proportionalWidth / 2) {
			//		currentRow.length -= 1;
			//		subtotalWidth -= proportionalWidth;
			//		a -= 1;
			//	}
				// if this is the last row and it has less orphans than allowed
				if (a === last && currentRow.length <= config.orphans) {
					subtotalWidth = config.col;
				}
				// for all the entries in the subtotal array
				for (c = 0 , d = currentRow.length; c < d; c += 1) {
					// convert the estimated width to a % of the row of pixels for older browsers
					compatibilityWidth = (config.fallback) ?
						Math.round(currentRow[c].proportionalWidth / subtotalWidth * (config.col - 18))  + 'px':
						(currentRow[c].proportionalWidth / subtotalWidth * 100)  + '%';
					// apply the new size context
					currentRow[c].object.style.width = compatibilityWidth;
					currentRow[c].object.style.height = 'auto';
				}
				// clear the subtotal
				currentRow = [];
				subtotalWidth = 0;
			}
		}
		// add photoZoom events
		if (hasLinks) {
			config.photozoom = new useful.Photozoom().init({
				'elements' : config.images.links,
				'container' : document.body,
				'zoom' : 2,
				'sizer' : null,
				'slicer' : this.config.slice,
				'opened' : this.config.opened,
				'located' : this.config.located,
				'closed' : this.config.closed
			});
		}
		// communicate the active state
		parent.element.className = parent.element.className.replace('-passive', '-active');
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photowall.Thumbnails;
}
