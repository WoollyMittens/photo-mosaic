/*
	Source:
	van Creij, Maurice (2012). "useful.photowall.js: Simple photo wall", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// private functions
	useful.Photowall = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		// methods
		this.start = function () {
			var context = this;
			// communicate the initial state
			context.obj.className += ' photowall-passive';
			// store the images
			context.cfg.images = {};
			context.cfg.images.links = context.obj.getElementsByTagName('a');
			context.cfg.images.objects = context.obj.getElementsByTagName('img');
			// prepare the contents
			context.prepare(context);
			// construct the spinner
			context.busy.build(context);
			// check every once in a while to see if the image dimensions are known yet
			context.cfg.wait = setInterval(function () {
				if (context.thumbnails.complete(context)) {
					// cancel the checking
					clearTimeout(context.cfg.wait);
					// measure the dimensions
					context.thumbnails.measure(context);
					// construct the wall
					context.thumbnails.redraw(context);
				}
			}, 500);
		};
		this.prepare = function (context) {
			// remove the white space
			context.obj.innerHTML = '<div class="photowall-bricks">' + context.obj.innerHTML.replace(/\t|\r|\n/g, '') + '</div>';
			// measure the container
			context.cfg.col = context.obj.offsetWidth;
			context.cfg.aspect = context.cfg.height / context.cfg.col;
		};
		this.busy = {};
		this.busy.build = function (context) {
			// construct the spinner
			context.cfg.spinner = document.createElement('div');
			context.cfg.spinner.className = 'photowall-busy photowall-busy-passive';
			context.obj.appendChild(context.cfg.spinner);
		};
		this.busy.show = function (context) {
			// show the spinner
			context.cfg.spinner.className = context.cfg.spinner.className.replace(/-passive/gi, '-active');
		};
		this.busy.hide = function (context) {
			// hide the spinner
			context.cfg.spinner.className = context.cfg.spinner.className.replace(/-active/gi, '-passive');
		};
		this.details = {};
		this.details.show = function (index, context) {
			// if the popup doesn't exist
			if (!context.cfg.popup) {
				// show the busy indicator
				context.busy.show(context);
				// create a container for the popup
				context.cfg.popup = document.createElement('div');
				context.cfg.popup.className = 'photowall-detail photowall-detail-passive';
				context.cfg.popup.className += (context.cfg.maximise) ? ' photowall-detail-maximise' : '';
				// add a close gadget
				context.details.addCloser(context);
				// add the popup to the parent
				context.obj.appendChild(context.cfg.popup);
				// add the image
				context.details.addImage(index, context);
				// show the popup
				//context.details.onOpen(context);
			}
		};
		this.details.addImage = function (index, context) {
			var popupWidth, popupHeight, popupAspect, image, imageSrc, imageSize, imageCaption;
			// measure the parent
			popupWidth = context.cfg.popup.offsetWidth;
			popupHeight = context.cfg.popup.offsetHeight;
			popupAspect = popupHeight / popupWidth;
			// based on the dimensions of the thumbnail, determine the size of the zoomed image
			imageSize = (context.cfg.images.aspects[index] > popupAspect) ? 'height=' + popupHeight : 'width=' + popupWidth;
			// get the source of the image
			imageSrc = context.cfg.images.links[index].getAttribute('href');
			// get a possible caption
			imageCaption = context.cfg.images.links[index].getAttribute('title') || context.cfg.images.objects[index].getAttribute('alt');
			// build the zoomed image
			image = document.createElement('img');
			image.className = 'photowall-image';
			image.setAttribute('alt', imageCaption);
			image.onload = context.details.onOpen(context);
			// add the image to the popup
			context.cfg.popup.appendChild(image);
			// load the image
			image.src = (context.cfg.slice) ?
				context.cfg.slice.replace('{src}', imageSrc).replace('{size}', imageSize):
				context.cfg.images.links[index];
		};
		this.details.addCloser = function (context) {
			var closer;
			// build a close gadget
			closer = document.createElement('a');
			closer.className = 'photowall-closer';
			closer.innerHTML = 'x';
			closer.href = '#close';
			// add the close event handler
			closer.onclick = context.details.onClose(context);
			// add the close gadget to the image
			context.cfg.popup.appendChild(closer);
		};
		this.details.onOpen = function (context) {
			return function () {
				var image;
				// if there is a popup
				if (context.cfg.popup) {
					// hide the busy indicator
					context.busy.hide(context);
					// centre the image
					image = context.cfg.popup.getElementsByTagName('img')[0];
					image.style.marginTop = Math.round((context.cfg.popup.offsetHeight - image.offsetHeight) / 2) + 'px';
					// reveal it
					context.cfg.popup.className = context.cfg.popup.className.replace(/-passive/gi, '-active');
				}
			};
		};
		this.details.onClose = function (context) {
			return function () {
				// if there is a popup
				if (context.cfg.popup) {
					// trigger the closed event if available
					if (context.cfg.closed !== null) {
						context.cfg.closed();
					}
					// unreveal the popup
					context.cfg.popup.className = context.cfg.popup.className.replace(/-active/gi, '-passive');
					// and after a while
					setTimeout(function () {
						// remove it
						context.obj.removeChild(context.cfg.popup);
						// remove its reference
						context.cfg.popup = null;
					}, 500);
				}
				// cancel the click
				return false;
			};
		};
		this.thumbnails = {};
		this.thumbnails.complete = function (context) {
			var a, b, passed = true;
			// for all the images
			for (a = 0 , b = context.cfg.images.objects.length; a < b; a += 1) {
				// if any of the images doesn't have a valid height
				passed = passed && context.cfg.images.objects[a].offsetWidth > 2;
			}
			// return the result
			return passed;
		};
		this.thumbnails.measure = function (context) {
			var a, b;
			// for all images
			context.cfg.images.widths = [];
			context.cfg.images.heights = [];
			context.cfg.images.aspects = [];
			for (a = 0 , b = context.cfg.images.objects.length; a < b; a += 1) {
				// get its dimensions
				context.cfg.images.widths[a] = context.cfg.images.objects[a].offsetWidth;
				context.cfg.images.heights[a] = context.cfg.images.objects[a].offsetHeight;
				context.cfg.images.aspects[a] = context.cfg.images.heights[a] / context.cfg.images.widths[a];
			}
		};
		this.thumbnails.redraw = function (context) {
			var a, b, last, c, d, compatibilityWidth, proportionalWidth, subtotalWidth = 0, currentRow = [],
				hasLinks = (context.cfg.images.links.length === context.cfg.images.objects.length);
			// for every image
			for (a = 0 , b = context.cfg.images.objects.length, last = b - 1; a < b; a += 1) {
				// calculate its width proportional to the given row height
				proportionalWidth = context.cfg.row / context.cfg.images.aspects[a];
				subtotalWidth += proportionalWidth;
				// add it to a subtotal array with the image and dimensions
				currentRow.push({
					'link' : context.cfg.images.links[a],
					'object' : context.cfg.images.objects[a],
					'proportionalWidth' : proportionalWidth
				});
				// if the subtotal exceeds a row's width
				if (subtotalWidth >= context.cfg.col || a === last) {
					// if the last image sticks out too far, discard it
				//	if (subtotalWidth - context.cfg.col > proportionalWidth / 2) {
				//		currentRow.length -= 1;
				//		subtotalWidth -= proportionalWidth;
				//		a -= 1;
				//	}
					// if this is the last row and it has less orphans than allowed
					if (a === last && currentRow.length <= context.cfg.orphans) {
						subtotalWidth = context.cfg.col;
					}
					// for all the entries in the subtotal array
					for (c = 0 , d = currentRow.length; c < d; c += 1) {
						// convert the estimated width to a % of the row of pixels for older browsers
						compatibilityWidth = (context.cfg.fallback) ?
							Math.round(currentRow[c].proportionalWidth / subtotalWidth * (context.cfg.col - 18))  + 'px':
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
				if (hasLinks) { context.cfg.images.links[a].onclick = context.thumbnails.clicked(a, context); }
			}
			// communicate the active state
			context.obj.className = context.obj.className.replace('-passive', '-active');
		};
		this.thumbnails.clicked = function (index, context) {
			return function () {
				var allowedToOpen;
				// trigger the opened event if available
				if (context.cfg.opened !== null) {
					// catch the reply from the opened event
					allowedToOpen = context.cfg.opened(context.cfg.images.objects[index], context.cfg.images.links[index]);
				}
				// open the popup, if there was no reply or a positive reply
				if (typeof(allowedToOpen) === 'undefined' || allowedToOpen === null || allowedToOpen) {
					context.details.show(index, context);
				}
				// cancel the click
				return false;
			};
		};
		this.focus = function (index) {
			var context = this;
			context.details.show(index, context);
		};
	};

}(window.useful = window.useful || {}));
