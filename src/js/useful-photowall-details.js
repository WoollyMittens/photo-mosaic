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
		this.image = null;
		this.translation = [];
		this.scaling = [];
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
				// add the touch events
				this.translation = [0,0,0];
				this.scaling = [1,1,1];
				this.gestures = new useful.Gestures( this.popup, {
					'drag' : this.onTransformed(),
					'pinch' : this.onTransformed(),
					'doubleTap' : this.onDoubleTapped()
				});
				// add the image
				this.addImage(index);
			}
		};
		this.addImage = function (index) {
			var parent = this.parent, cfg = this.parent.cfg,
				popupWidth, popupHeight, popupAspect, imageSrc, imageSize, imageCaption,
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
			this.image = document.createElement('img');
			this.image.className = 'photowall-image';
			this.image.setAttribute('alt', imageCaption);
			this.image.onload = this.onOpen();
			this.image.onerror = this.onFail(index);
			// pick the dimensions based on the aspect ratio
			if (imageAspect > popupAspect) {
				this.image.style.width = 'auto';
				this.image.style.height = '100%';
				imageSize = 'height=' + (popupHeight * cfg.zoom);
			} else {
				this.image.style.height = 'auto';
				this.image.style.width = '100%';
				imageSize = 'width=' + (popupWidth * cfg.zoom);
			}
			// add the image to the popup
			this.popup.appendChild(this.image);
			// load the image
			this.image.src = (cfg.slice) ?
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
			var parent = this.parent, cfg = this.parent.cfg, locator;
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
		this.zoomImage = function (coords) {
			var cfg = this.parent.cfg;
			// apply the scaling
			if (coords.scale !== undefined) {
				this.scaling[0] = Math.min( Math.max( this.scaling[0] + coords.scale, 1 ), cfg.zoom );
				this.scaling[1] = Math.min( Math.max( this.scaling[1] + coords.scale, 1 ), cfg.zoom );
			}
			// apply the translation
			if (coords.horizontal !== undefined && coords.vertical !== undefined) {
				this.translation[0] = this.translation[0] + coords.horizontal / 2 / this.scaling[0];
				this.translation[1] = this.translation[1] + coords.vertical / 2 / this.scaling[1];
			}
			// limit the translation
			var overscanX = Math.max((this.image.offsetWidth * this.scaling[0] / this.popup.offsetWidth - 1) * 50 / this.scaling[0], 0),
				overscanY = Math.max((this.image.offsetHeight * this.scaling[1] / this.popup.offsetHeight - 1) * 50 / this.scaling[1], 0);
			this.translation[0] = Math.min( Math.max( this.translation[0] , -overscanX), overscanX );
			this.translation[1] = Math.min( Math.max( this.translation[1] , -overscanY), overscanY );
			// formulate the style rule
			var scaling = 'scale3d(' + this.scaling.join(',') + ')',
				translation = 'translate3d(' + this.translation.join('%,') + ')';
			// apply the style rule
			this.image.style.transform = scaling + ' ' + translation;
			this.image.style.webkitTransform = scaling + ' ' + translation;
		};
		// event handlers
		this.onLocate = function (index) {
			var _this = this, cfg = this.parent.cfg;
			return function () {
				// trigger the opened event if available
				if (cfg.located) {
					// catch the reply from the opened event
					cfg.located(cfg.images.objects[index], cfg.images.links[index]);
				}
			};
		};
		this.onDoubleTapped = function () {
			var _this = this;
			return function () {
				_this.zoomImage({
					'scale' : (_this.scaling[0] === 1) ? _this.parent.cfg.zoom : -_this.parent.cfg.zoom,
				});
			};
		};
		this.onTransformed = function () {
			var _this = this;
			return function (coords) {
				_this.zoomImage(coords);
			};
		};
		this.onOpen = function () {
			var _this = this;
			return function () {
				var image, parent = _this.parent, cfg = _this.parent.cfg;
				// if there is a popup
				if (_this.popup) {
					// hide the busy indicator
					parent.busy.hide();
					// centre the image
					image = _this.popup.getElementsByTagName('img')[0];
					image.style.marginTop = Math.round((_this.popup.offsetHeight - image.offsetHeight) / 2) + 'px';
					// reveal it
					_this.popup.className = _this.popup.className.replace(/-passive/gi, '-active');
				}
			};
		};
		this.onFail = function (index) {
			var _this = this;
			return function () {
				var parent = _this.parent, cfg = _this.parent.cfg;
				// give up on the popup
				if (_this.popup) {
					// hide the busy indicator
					parent.busy.hide();
					// remove it
					parent.obj.removeChild(_this.popup);
					// remove its reference
					_this.popup = null;
					_this.image = null;
					_this.gestures = null;
				}
				// trigger the opened handler directly
				if (cfg.located !== null) {
					// catch the reply from the opened event
					cfg.located(cfg.images.objects[index], cfg.images.links[index]);
				}
			};
		};
		this.onClose = function () {
			var _this = this;
			return function () {
				var parent = _this.parent, cfg = _this.parent.cfg;
				// if there is a popup
				if (_this.popup) {
					// trigger the closed event if available
					if (cfg.closed !== null) { cfg.closed(); }
					// unreveal the popup
					_this.popup.className = _this.popup.className.replace(/-active/gi, '-passive');
					// and after a while
					setTimeout(function () {
						// remove it
						parent.obj.removeChild(_this.popup);
						// remove its reference
						_this.popup = null;
						_this.image = null;
						_this.gestures = null;
					}, 500);
				}
				// cancel the click
				return false;
			};
		};
	};

}(window.useful = window.useful || {}));
