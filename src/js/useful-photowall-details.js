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
	useful.Photowall_Details = function (parent) {
		// properties
		this.parent = parent;
		this.popup = null;
		// methods
		this.show = function (index) {
			var parent = this.parent, cfg = this.parent.cfg;
			// if the popup doesn't exist
			if (!this.popup) {
				// show the busy indicator
				parent.busy.show();
				// create a container for the popup
				this.popup = document.createElement('div');
				this.popup.className = 'photowall-detail photowall-detail-passive';
				this.popup.className += (cfg.maximise) ? ' photowall-detail-maximise' : '';
				// add a close gadget
				this.addCloser();
				// add a locator gadget
				this.addLocator(index);
				// add the popup to the parent
				parent.obj.appendChild(this.popup);
				// add the image
				this.addImage(index);
			}
		};
		this.addImage = function (index) {
			var parent = this.parent, cfg = this.parent.cfg,
				popupWidth, popupHeight, popupAspect, image, imageSrc, imageSize, imageCaption,
				imageAspect = cfg.images.aspects[index];
			// measure the parent
			popupWidth = this.popup.offsetWidth;
			popupHeight = this.popup.offsetHeight;
			popupAspect = popupHeight / popupWidth;
			// get the source of the image
			imageSrc = cfg.images.links[index].getAttribute('href');
			// get a possible caption
			imageCaption = cfg.images.links[index].getAttribute('title') || cfg.images.objects[index].getAttribute('alt');
			// build the zoomed image
			image = document.createElement('img');
			image.className = 'photowall-image';
			image.setAttribute('alt', imageCaption);
			image.onload = this.onOpen();
			image.onerror = this.onFail(index);
			// pick the dimensions based on the aspect ratio
			if (imageAspect > popupAspect) {
				image.style.width = 'auto';
				image.style.height = '100%';
				imageSize = 'height=' + popupHeight;
			} else {
				image.style.height = 'auto';
				image.style.width = '100%';
				imageSize = 'width=' + popupWidth;
			}
			// add the image to the popup
			this.popup.appendChild(image);
			// load the image
			image.src = (cfg.slice) ?
				cfg.slice.replace('{src}', imageSrc).replace('{size}', imageSize):
				cfg.images.links[index];
		};
		this.addCloser = function () {
			var parent = this.parent, cfg = this.parent.cfg, closer;
			// build a close gadget
			closer = document.createElement('a');
			closer.className = 'photowall-closer';
			closer.innerHTML = 'Close';
			closer.href = '#close';
			// add the close event handler
			closer.onclick = this.onClose();
			// add the close gadget to the image
			this.popup.appendChild(closer);
		};
		this.addLocator = function (index) {
			var parent = this.parent, cfg = this.parent.cfg, locator,
			// build the geo marker icon
			locator = document.createElement('a');
			locator.className = 'photowall-locator';
			locator.innerHTML = 'Show on a map';
			locator.href = '#map';
			// add the event handler
			locator.onclick = this.onLocate(index);
			// add the location marker to the image
			this.popup.appendChild(locator);
		};
		this.onLocate = function (index) {
			var context = this, cfg = this.parent.cfg;
			return function () {
				// trigger the opened event if available
				if (cfg.located !== null) {
					// catch the reply from the opened event
					cfg.located(cfg.images.objects[index], cfg.images.links[index]);
				}
			};
		};
		this.onOpen = function () {
			var context = this;
			return function () {
				var image, parent = context.parent, cfg = context.parent.cfg;
				// if there is a popup
				if (context.popup) {
					// hide the busy indicator
					parent.busy.hide();
					// centre the image
					image = context.popup.getElementsByTagName('img')[0];
					image.style.marginTop = Math.round((context.popup.offsetHeight - image.offsetHeight) / 2) + 'px';
					// reveal it
					context.popup.className = context.popup.className.replace(/-passive/gi, '-active');
				}
			};
		};
		this.onFail = function (index) {
			var context = this;
			return function () {
				var parent = context.parent, cfg = context.parent.cfg;
				// give up on the popup
				if (context.popup) {
					// hide the busy indicator
					parent.busy.hide();
					// remove it
					parent.obj.removeChild(context.popup);
					// remove its reference
					context.popup = null;
				};
				// trigger the opened handler directly
				if (cfg.located !== null) {
					// catch the reply from the opened event
					cfg.located(cfg.images.objects[index], cfg.images.links[index]);
				}
			};
		};
		this.onClose = function () {
			var context = this;
			return function () {
				var parent = context.parent, cfg = context.parent.cfg;
				// if there is a popup
				if (context.popup) {
					// trigger the closed event if available
					if (cfg.closed !== null) { cfg.closed(); }
					// unreveal the popup
					context.popup.className = context.popup.className.replace(/-active/gi, '-passive');
					// and after a while
					setTimeout(function () {
						// remove it
						parent.obj.removeChild(context.popup);
						// remove its reference
						context.popup = null;
					}, 500);
				}
				// cancel the click
				return false;
			};
		};
	};

}(window.useful = window.useful || {}));
