/*
	Source:
	van Creij, Maurice (2014). "useful.photowall.js: Simple photo wall", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Photowall_Thumbnails = function (parent) {
		// properties
		this.parent = parent;
		// methods
		this.complete = function () {
			var a, b, passed = true, parent = this.parent, cfg = this.parent.cfg;
			// for all the images
			for (a = 0 , b = cfg.images.objects.length; a < b; a += 1) {
				// if any of the images doesn't have a valid height
				passed = passed && cfg.images.objects[a].offsetWidth > 2;
			}
			// return the result
			return passed;
		};
		this.measure = function () {
			var parent = this.parent, cfg = this.parent.cfg, a, b;
			// for all images
			cfg.images.widths = [];
			cfg.images.heights = [];
			cfg.images.aspects = [];
			for (a = 0 , b = cfg.images.objects.length; a < b; a += 1) {
				// get its dimensions
				cfg.images.widths[a] = cfg.images.objects[a].offsetWidth;
				cfg.images.heights[a] = cfg.images.objects[a].offsetHeight;
				cfg.images.aspects[a] = cfg.images.heights[a] / cfg.images.widths[a];
			}
		};
		this.redraw = function () {
			var parent = this.parent, cfg = this.parent.cfg,
				a, b, last, c, d, compatibilityWidth, proportionalWidth, subtotalWidth = 0, currentRow = [],
				hasLinks = (cfg.images.links.length === cfg.images.objects.length);
			// for every image
			for (a = 0 , b = cfg.images.objects.length, last = b - 1; a < b; a += 1) {
				// calculate its width proportional to the given row height
				proportionalWidth = cfg.row / cfg.images.aspects[a];
				subtotalWidth += proportionalWidth;
				// add it to a subtotal array with the image and dimensions
				currentRow.push({
					'link' : cfg.images.links[a],
					'object' : cfg.images.objects[a],
					'proportionalWidth' : proportionalWidth
				});
				// if the subtotal exceeds a row's width
				if (subtotalWidth >= cfg.col || a === last) {
					// if the last image sticks out too far, discard it
				//	if (subtotalWidth - cfg.col > proportionalWidth / 2) {
				//		currentRow.length -= 1;
				//		subtotalWidth -= proportionalWidth;
				//		a -= 1;
				//	}
					// if this is the last row and it has less orphans than allowed
					if (a === last && currentRow.length <= cfg.orphans) {
						subtotalWidth = cfg.col;
					}
					// for all the entries in the subtotal array
					for (c = 0 , d = currentRow.length; c < d; c += 1) {
						// convert the estimated width to a % of the row of pixels for older browsers
						compatibilityWidth = (cfg.fallback) ?
							Math.round(currentRow[c].proportionalWidth / subtotalWidth * (cfg.col - 18))  + 'px':
							(currentRow[c].proportionalWidth / subtotalWidth * 100)  + '%';
						// apply the new size context
						currentRow[c].object.style.width = compatibilityWidth;
						currentRow[c].object.style.height = 'auto';
					}
					// clear the subtotal
					currentRow = [];
					subtotalWidth = 0;
				}
				// add an event handler to the link if there is one
				if (hasLinks) { cfg.images.links[a].onclick = this.clicked(a); }
			}
			// communicate the active state
			parent.obj.className = parent.obj.className.replace('-passive', '-active');
		};
		this.clicked = function (index) {
			var context = this;
			return function (event) {
				var parent = context.parent, cfg = context.parent.cfg, allowedToOpen;
				// cancel the click
				event.preventDefault();
				// trigger the opened event if available
				if (cfg.opened !== null) {
					// catch the reply from the opened event
					allowedToOpen = cfg.opened(cfg.images.objects[index], cfg.images.links[index]);
				}
				// open the popup, if there was no reply or a positive reply
				if (typeof(allowedToOpen) === 'undefined' || allowedToOpen === null || allowedToOpen) {
					parent.details.show(index);
				}
			};
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Photowall_Thumbnails;
	}

})();
