/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Main = function (config, context) {

	// PROPERTIES

	"use strict";
	this.config = config;
	this.context = context;
	this.element = config.element;
	this.paused = false;

	// METHODS

	this.init = function () {
		// check the configuration properties
		this.config = this.checkConfig(config);
		// add the single touch events
		if (config.allowSingle) { this.single = new this.context.Single(this).init(); }
		// add the multi touch events
		if (config.allowMulti) { this.multi = new this.context.Multi(this).init(); }
		// return the object
		return this;
	};

	this.checkConfig = function (config) {
		// add default values for missing ones
		config.threshold = config.threshold || 50;
		config.increment = config.increment || 0.1;
		// cancel all events by default
		if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
		if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
		// add dummy event handlers for missing ones
		if (config.swipeUp || config.swipeLeft || config.swipeRight || config.swipeDown || config.drag || config.doubleTap) {
			config.allowSingle = true;
			config.swipeUp = config.swipeUp || function () {};
			config.swipeLeft = config.swipeLeft || function () {};
			config.swipeRight = config.swipeRight || function () {};
			config.swipeDown = config.swipeDown || function () {};
			config.drag = config.drag || function () {};
			config.doubleTap = config.doubleTap || function () {};
		}
		// if there's pinch there's also twist
		if (config.pinch || config.twist) {
			config.allowMulti = true;
			config.pinch = config.pinch || function () {};
			config.twist = config.twist || function () {};
		}
		// return the fixed config
		return config;
	};

	this.readEvent = function (event) {
		var coords = {}, offsets;
		// try all likely methods of storing coordinates in an event
		if (event.touches && event.touches[0]) {
			coords.x = event.touches[0].pageX;
			coords.y = event.touches[0].pageY;
		} else if (event.pageX !== undefined) {
			coords.x = event.pageX;
			coords.y = event.pageY;
		} else {
			coords.x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
			coords.y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
		}
		return coords;
	};

	this.correctOffset = function (element) {
		var offsetX = 0, offsetY = 0;
		// if there is an offset
		if (element.offsetParent) {
			// follow the offsets back to the right parent element
			while (element !== this.element) {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			}
		}
		// return the offsets
		return { 'x' : offsetX, 'y' : offsetY };
	};

	// EXTERNAL

	this.enableDefaultTouch = function () {
		this.config.cancelTouch = false;
	};

	this.disableDefaultTouch = function () {
		this.config.cancelTouch = true;
	};

	this.enableDefaultGesture = function () {
		this.config.cancelGesture = false;
	};

	this.disableDefaultGesture = function () {
		this.config.cancelGesture = true;
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Main;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Multi = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.gestureOrigin = null;
	this.gestureProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousewheel', this.onChangeWheel());
		if (navigator.userAgent.match(/firefox/gi)) { this.element.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
		// set the required events for gestures
		if ('ongesturestart' in window) {
			this.element.addEventListener('gesturestart', this.onStartGesture());
			this.element.addEventListener('gesturechange', this.onChangeGesture());
			this.element.addEventListener('gestureend', this.onEndGesture());
		} else if ('msgesturestart' in window) {
			this.element.addEventListener('msgesturestart', this.onStartGesture());
			this.element.addEventListener('msgesturechange', this.onChangeGesture());
			this.element.addEventListener('msgestureend', this.onEndGesture());
		} else {
			this.element.addEventListener('touchstart', this.onStartFallback());
			this.element.addEventListener('touchmove', this.onChangeFallback());
			this.element.addEventListener('touchend', this.onEndFallback());
		}
		// return the object
		return this;
	};

	this.cancelGesture = function (event) {
		if (this.config.cancelGesture) {
			event = event || window.event;
			event.preventDefault();
		}
	};

	this.startGesture = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// note the start position
			this.gestureOrigin = {
				'scale' : event.scale,
				'rotation' : event.rotation,
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'scale' : this.gestureOrigin.scale,
				'rotation' : this.gestureOrigin.rotation
			};
		}
	};

	this.changeGesture = function (event) {
		// if there is an origin
		if (this.gestureOrigin) {
			// get the distances from the event
			var scale = event.scale,
				rotation = event.rotation;
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale - this.gestureProgression.scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			this.config.twist({
				'x' : coords.x,
				'y' : coords.y,
				'rotation' : rotation - this.gestureProgression.rotation,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'scale' : event.scale,
				'rotation' : event.rotation
			};
		}
	};

	this.endGesture = function () {
		// note the start position
		this.gestureOrigin = null;
	};

	// FALLBACK

	this.startFallback = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused && event.touches.length === 2) {
			// note the start position
			this.gestureOrigin = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				],
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'touches' : this.gestureOrigin.touches
			};
		}
	};

	this.changeFallback = function (event) {
		// if there is an origin
		if (this.gestureOrigin && event.touches.length === 2) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// calculate the scale factor
			var scale = 0, progression = this.gestureProgression;
			scale += (event.touches[0].pageX - event.touches[1].pageX) / (progression.touches[0].pageX - progression.touches[1].pageX);
			scale += (event.touches[0].pageY - event.touches[1].pageY) / (progression.touches[0].pageY - progression.touches[1].pageY);
			scale = scale - 2;
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				]
			};
		}
	};

	this.endFallback = function () {
		// note the start position
		this.gestureOrigin = null;
	};

	this.changeWheel = function (event) {
		// measure the wheel distance
		var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
		// get the coordinates from the event
		var coords = this.parent.readEvent(event);
		// equate wheeling up / down to zooming in / out
		scale = (distance > 0) ? +this.config.increment : scale = -this.config.increment;
		// report the zoom
		this.config.pinch({
			'x' : coords.x,
			'y' : coords.y,
			'scale' : scale,
			'event' : event,
			'source' : event.target || event.srcElement
		});
	};

	// GESTURE EVENTS

	this.onStartGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.startGesture(event);
			_this.changeGesture(event);
		};
	};

	this.onChangeGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeGesture(event);
		};
	};

	this.onEndGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// FALLBACK EVENTS

	this.onStartFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			//_this.cancelGesture(event);
			// handle the event
			_this.startFallback(event);
			_this.changeFallback(event);
		};
	};

	this.onChangeFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeFallback(event);
		};
	};

	this.onEndFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// MOUSE EVENTS

	this.onChangeWheel = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeWheel(event);
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Multi;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.Single = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.lastTouch = null;
	this.touchOrigin = null;
	this.touchProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousedown', this.onStartTouch());
		this.element.addEventListener('mousemove', this.onChangeTouch());
		document.body.addEventListener('mouseup', this.onEndTouch());
		// set the required events for touch
		this.element.addEventListener('touchstart', this.onStartTouch());
		this.element.addEventListener('touchmove', this.onChangeTouch());
		document.body.addEventListener('touchend', this.onEndTouch());
		this.element.addEventListener('mspointerdown', this.onStartTouch());
		this.element.addEventListener('mspointermove', this.onChangeTouch());
		document.body.addEventListener('mspointerup', this.onEndTouch());
		// return the object
		return this;
	};

	this.cancelTouch = function (event) {
		if (this.config.cancelTouch) {
			event = event || window.event;
			event.preventDefault();
		}
	};

	this.startTouch = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// note the start position
			this.touchOrigin = {
				'x' : coords.x,
				'y' : coords.y,
				'target' : event.target || event.srcElement
			};
			this.touchProgression = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y
			};
		}
	};

	this.changeTouch = function (event) {
		// if there is an origin
		if (this.touchOrigin) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.config.drag({
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'horizontal' : coords.x - this.touchProgression.x,
				'vertical' : coords.y - this.touchProgression.y,
				'event' : event,
				'source' : this.touchOrigin.target
			});
			// update the current position
			this.touchProgression = {
				'x' : coords.x,
				'y' : coords.y
			};
		}
	};

	this.endTouch = function (event) {
		// if the numbers are valid
		if (this.touchOrigin && this.touchProgression) {
			// calculate the motion
			var distance = {
				'x' : this.touchProgression.x - this.touchOrigin.x,
				'y' : this.touchProgression.y - this.touchOrigin.y
			};
			// if there was very little movement, but this is the second touch in quick successionif (
			if (
				this.lastTouch &&
				Math.abs(this.touchOrigin.x - this.lastTouch.x) < 10 &&
				Math.abs(this.touchOrigin.y - this.lastTouch.y) < 10 &&
				new Date().getTime() - this.lastTouch.time < 500 &&
				new Date().getTime() - this.lastTouch.time > 100
			) {
				// treat this as a double tap
				this.config.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : event, 'source' : this.touchOrigin.target});
			// if the horizontal motion was the largest
			} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
				// if there was a right swipe
				if (distance.x > this.config.threshold) {
					// report the associated swipe
					this.config.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was a left swipe
				} else if (distance.x < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				}
			// else
			} else {
				// if there was a down swipe
				if (distance.y > this.config.threshold) {
					// report the associated swipe
					this.config.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was an up swipe
				} else if (distance.y < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				}
			}
			// store the history of this touch
			this.lastTouch = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'time' : new Date().getTime()
			};
		}
		// clear the input
		this.touchProgression = null;
		this.touchOrigin = null;
	};

	// TOUCH EVENTS

	this.onStartTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.startTouch(event);
			_this.changeTouch(event);
		};
	};

	this.onChangeTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelTouch(event);
			// handle the event
			_this.changeTouch(event);
		};
	};

	this.onEndTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.endTouch(event);
		};
	};

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Single;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.init = function (config) {

	// PROPERTIES
	
	"use strict";

	// METHODS
	
	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this).init();
	};
	
	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context).init();
		}
		// return the instances
		return instances;
	};

	// START

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.photozoom.js: Overlays a full screen preview of a thumbnail", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photozoom = useful.Photozoom || function () {};

// extend the constructor
useful.Photozoom.prototype.Busy = function (container) {

	// PROPERTIES

	"use strict";
	this.container = container;

	// METHODS

	this.init = function () {
		// construct the spinner
		this.spinner = document.createElement('div');
		this.spinner.className = (this.container === document.body) ?
			'photozoom-busy photozoom-busy-fixed photozoom-busy-passive':
			'photozoom-busy photozoom-busy-passive';
		this.container.appendChild(this.spinner);
		// return the object
		return this;
	};

	this.show = function () {
		// show the spinner
		this.spinner.className = this.spinner.className.replace(/-passive/gi, '-active');
	};

	this.hide = function () {
		// hide the spinner
		this.spinner.className = this.spinner.className.replace(/-active/gi, '-passive');
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photozoom.Busy;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.photozoom.js: Overlays a full screen preview of a thumbnail", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photozoom = useful.Photozoom || function () {};

// extend the constructor
useful.Photozoom.prototype.Main = function (config, context) {

	// PROPERTIES

	"use strict";
	this.config = config;
	this.context = context;
	this.element = config.element;

	// METHODS

	this.init = function () {
		var a, b;
		// apply the default values
		this.config.container = this.config.container || document.body;
		this.config.zoom = this.config.zoom || 1;
		this.config.sizer = this.config.sizer || null;
		this.config.slicer = this.config.slicer || '{src}';
		// construct the spinner
		this.busy = new this.context.Busy(this.config.container).init();
		// apply the event handlers
		this.element.addEventListener('click', this.onShow());
		// return the object
		return this;
	};

	this.hide = function () {
		var _this = this;
		// if there is a popup
		if (this.popup) {
			// unreveal the popup
			this.popup.className = this.popup.className.replace(/-active/gi, '-passive');
			// and after a while
			setTimeout(function () {
				// remove it
				_this.config.container.removeChild(_this.popup);
				// remove its reference
				_this.popup = null;
				_this.image = null;
				_this.gestures = null;
			}, 500);
		}
	};

	this.show = function (url, desc, aspect) {
		// if the popup doesn't exist
		if (!this.popup) {
			// show the busy indicator
			this.busy.show();
			// create a container for the popup
			this.popup = document.createElement('figure');
			this.popup.className = (this.config.container === document.body) ?
				'photozoom-popup photozoom-popup-fixed photozoom-popup-passive':
				'photozoom-popup photozoom-popup-passive';
			// add a close gadget
			this.addCloser();
			// add a locator gadget
			this.addLocator();
			// add the popup to the document
			this.config.container.appendChild(this.popup);
			// add the touch events
			this.translation = [0,0];
			this.scaling = [1,1];
			this.gestures = new useful.Gestures().init({
				'element' : this.popup,
				'drag' : this.onTransformed(),
				'pinch' : this.onTransformed(),
				'doubleTap' : this.onDoubleTapped()
			});
			// use a blank description if not given
			desc = desc || '';
			// figure out the aspect ratio of the image
			this.checkImage(url, desc, aspect);
		}
	};

	this.zoom = function (coords) {
		// apply the scaling
		if (coords.scale !== undefined) {
			this.scaling[0] = Math.min( Math.max( this.scaling[0] + coords.scale, 1 ), config.zoom );
			this.scaling[1] = Math.min( Math.max( this.scaling[1] + coords.scale, 1 ), config.zoom );
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
		var scaling = 'scale(' + this.scaling.join(',') + ')',
			translation = 'translate(' + this.translation.join('%,') + '%)';
		// apply the style rule
		this.image.style.transform = scaling + ' ' + translation;
		this.image.style.webkitTransform = scaling + ' ' + translation;
		this.image.style.msTransform = scaling + ' ' + translation;
	};

	this.addCloser = function () {
		var closer;
		// build a close gadget
		closer = document.createElement('a');
		closer.className = 'photozoom-closer';
		closer.innerHTML = 'x';
		closer.href = '#close';
		// add the close event handler
		closer.onclick = this.onHide();
		// add the close gadget to the image
		this.popup.appendChild(closer);
	};

	this.addLocator = function (url) {
		var parent = this.parent, config = this.config, locator;
		// build the geo marker icon
		locator = document.createElement('a');
		locator.className = 'photozoom-locator';
		locator.innerHTML = 'Show on a map';
		locator.href = '#map';
		// add the event handler
		locator.onclick = this.onLocate();
		// add the location marker to the image
		this.popup.appendChild(locator);
	};

	this.checkImage = function (url, desc, aspect) {
		// if the aspect is known
		if (aspect) {
			// add the image
			this.addImage(url, desc, aspect);
		// else if the size web-service is available
		} else if (this.config.sizer) {
			// retrieve the dimensions first
			var _this = this;
			useful.request.send({
				url : this.config.sizer.replace(/{src}/g, url),
				post : null,
				onProgress : function () {},
				onFailure : function () {},
				onSuccess : function (reply) {
					var dimensions = JSON.parse(reply.responseText);
					_this.addImage(url, desc, dimensions.y[0] / dimensions.x[0]);
				}
			});
		}
	};

	this.addImage = function (url, desc, aspect) {
		var caption, image, size,
			width = this.popup.offsetWidth,
			height = this.popup.offsetHeight;
		// add the caption
		caption = document.createElement('figcaption');
		caption.className = 'photozoom-caption';
		caption.innerHTML = desc;
		// add the zoomed image
		image = document.createElement('img');
		image.className = 'photozoom-image';
		image.setAttribute('alt', desc);
		image.onload = this.onReveal();
		image.onerror = this.onFail();
		// pick the dimensions based on the aspect ratio
		if (aspect > height / width) {
			image.removeAttribute('width');
			image.setAttribute('height', '100%');
			size = 'height=' + (height * this.config.zoom);
		} else {
			image.setAttribute('width', '100%');
			image.removeAttribute('height');
			size = 'width=' + (width * this.config.zoom);
		}
		// add the components to the popup
		this.popup.appendChild(image);
		this.popup.appendChild(caption);
		this.image = image;
		// load the image
		image.src = (this.config.slicer) ? this.config.slicer.replace('{src}', url).replace('{size}', size) : url;
	};

	// EVENTS

	this.onLocate = function () {
		var _this = this;
		return function () {
			var config = _this.config;
			console.log('located', config.located);
			// trigger the located event if available
			if (config.located) { config.located(_this.element); }
		};
	};

	this.onHide = function () {
		var _this = this;
		return function (evt) {
			var config = _this.config;
			// cancel the click
			evt.preventDefault();
			// close the popup
			_this.hide();
			// trigger the closed event if available
			if (config.closed !== null) { config.closed(_this.element); }
		};
	};

	this.onShow = function () {
		var _this = this;
		return function (event) {
			var config = _this.config;
			// cancel the click
			event.preventDefault();
			// try to scrape together the required properties
			var url = _this.element.getAttribute('href') || _this.element.getAttribute('src'),
				desc = _this.element.getAttribute('title') || _this.element.getAttribute('alt'),
				image = (_this.element.nodeName === 'IMG') ? _this.element : _this.element.getElementsByTagName('img')[0],
				aspect = image.offsetHeight / image.offsetWidth;
			// trigger the opened event if available
			var allowed = (config.opened) ? config.opened(_this.element) : function () { return true; };
			// show the popup if allowed by the open event
			if (allowed) { _this.show(url, desc, aspect); }
		};
	};

	this.onFail = function (index) {
		var _this = this;
		return function () {
			var config = _this.config;
			// give up on the popup
			if (_this.popup) {
				// remove the popup
				config.container.removeChild(_this.popup);
				// remove its reference
				_this.popup = null;
				_this.image = null;
				_this.gestures = null;
			}
			// trigger the located handler directly
			if (config.located) { config.located(_this.element); }
			// hide the busy indicator
			_this.busy.hide();
		};
	};

	this.onReveal = function () {
		var _this = this;
		return function () {
			var image, popup = _this.popup;
			// if there is a popup
			if (popup) {
				// find the image in the popup
				image = _this.popup.getElementsByTagName('img')[0];
				// hide the busy indicator
				_this.busy.hide();
				// centre the image
				image.style.marginTop = Math.round((popup.offsetHeight - image.offsetHeight) / 2) + 'px';
				// reveal it
				popup.className = popup.className.replace(/-passive/gi, '-active');
			}
		};
	};

	this.onDoubleTapped = function () {
		var _this = this;
		return function () {
			_this.zoom({
				'scale' : (_this.scaling[0] === 1) ? _this.config.zoom : -_this.config.zoom,
			});
		};
	};

	this.onTransformed = function () {
		var _this = this;
		return function (coords) {
			_this.zoom(coords);
		};
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photozoom.Main;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.photozoom.js: Overlays a full screen preview of a thumbnail", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photozoom = useful.Photozoom || function () {};

// extend the constructor
useful.Photozoom.prototype.init = function (config) {

	// PROPERTIES
	
	"use strict";

	// METHODS
	
	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this).init();
	};
	
	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context).init();
		}
		// return the instances
		return instances;
	};

	// START

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photozoom;
}

/*
	Source:
	van Creij, Maurice (2014). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function() {

    // Invoke strict mode
    "use strict";

    // Create a private object for this library
    useful.polyfills = {

        // enabled the use of HTML5 elements in Internet Explorer
        html5: function() {
            var a, b, elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
            if (navigator.userAgent.match(/msie/gi)) {
                for (a = 0, b = elementsList.length; a < b; a += 1) {
                    document.createElement(elementsList[a]);
                }
            }
        },

        // allow array.indexOf in older browsers
        arrayIndexOf: function() {
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function(obj, start) {
                    for (var i = (start || 0), j = this.length; i < j; i += 1) {
                        if (this[i] === obj) {
                            return i;
                        }
                    }
                    return -1;
                };
            }
        },

        // allow array.map in older browsers (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
        arrayMap: function() {

            // Production steps of ECMA-262, Edition 5, 15.4.4.19
            // Reference: http://es5.github.io/#x15.4.4.19
            if (!Array.prototype.map) {

                Array.prototype.map = function(callback, thisArg) {

                    var T, A, k;

                    if (this == null) {
                        throw new TypeError(' this is null or not defined');
                    }

                    // 1. Let O be the result of calling ToObject passing the |this|
                    //    value as the argument.
                    var O = Object(this);

                    // 2. Let lenValue be the result of calling the Get internal
                    //    method of O with the argument "length".
                    // 3. Let len be ToUint32(lenValue).
                    var len = O.length >>> 0;

                    // 4. If IsCallable(callback) is false, throw a TypeError exception.
                    // See: http://es5.github.com/#x9.11
                    if (typeof callback !== 'function') {
                        throw new TypeError(callback + ' is not a function');
                    }

                    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                    if (arguments.length > 1) {
                        T = thisArg;
                    }

                    // 6. Let A be a new array created as if by the expression new Array(len)
                    //    where Array is the standard built-in constructor with that name and
                    //    len is the value of len.
                    A = new Array(len);

                    // 7. Let k be 0
                    k = 0;

                    // 8. Repeat, while k < len
                    while (k < len) {

                        var kValue, mappedValue;

                        // a. Let Pk be ToString(k).
                        //   This is implicit for LHS operands of the in operator
                        // b. Let kPresent be the result of calling the HasProperty internal
                        //    method of O with argument Pk.
                        //   This step can be combined with c
                        // c. If kPresent is true, then
                        if (k in O) {

                            // i. Let kValue be the result of calling the Get internal
                            //    method of O with argument Pk.
                            kValue = O[k];

                            // ii. Let mappedValue be the result of calling the Call internal
                            //     method of callback with T as the this value and argument
                            //     list containing kValue, k, and O.
                            mappedValue = callback.call(T, kValue, k, O);

                            // iii. Call the DefineOwnProperty internal method of A with arguments
                            // Pk, Property Descriptor
                            // { Value: mappedValue,
                            //   Writable: true,
                            //   Enumerable: true,
                            //   Configurable: true },
                            // and false.

                            // In browsers that support Object.defineProperty, use the following:
                            // Object.defineProperty(A, k, {
                            //   value: mappedValue,
                            //   writable: true,
                            //   enumerable: true,
                            //   configurable: true
                            // });

                            // For best browser support, use the following:
                            A[k] = mappedValue;
                        }
                        // d. Increase k by 1.
                        k++;
                    }

                    // 9. return A
                    return A;
                };
            }

        },

        // allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
        querySelectorAll: function() {
            if (!document.querySelectorAll) {
                document.querySelectorAll = function(a) {
                    var b = document,
                        c = b.documentElement.firstChild,
                        d = b.createElement("STYLE");
                    return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
                };
            }
        },

        // allow addEventListener (https://gist.github.com/jonathantneal/3748027)
        addEventListener: function() {
            !window.addEventListener && (function(WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
                WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function(type, listener) {
                    var target = this;
                    registry.unshift([target, type, listener, function(event) {
                        event.currentTarget = target;
                        event.preventDefault = function() {
                            event.returnValue = false;
                        };
                        event.stopPropagation = function() {
                            event.cancelBubble = true;
                        };
                        event.target = event.srcElement || target;
                        listener.call(target, event);
                    }]);
                    this.attachEvent("on" + type, registry[0][3]);
                };
                WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function(type, listener) {
                    for (var index = 0, register; register = registry[index]; ++index) {
                        if (register[0] == this && register[1] == type && register[2] == listener) {
                            return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
                        }
                    }
                };
                WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function(eventObject) {
                    return this.fireEvent("on" + eventObject.type, eventObject);
                };
            })(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
        },

        // allow console.log
        consoleLog: function() {
            var overrideTest = new RegExp('console-log', 'i');
            if (!window.console || overrideTest.test(document.querySelectorAll('html')[0].className)) {
                window.console = {};
                window.console.log = function() {
                    // if the reporting panel doesn't exist
                    var a, b, messages = '',
                        reportPanel = document.getElementById('reportPanel');
                    if (!reportPanel) {
                        // create the panel
                        reportPanel = document.createElement('DIV');
                        reportPanel.id = 'reportPanel';
                        reportPanel.style.background = '#fff none';
                        reportPanel.style.border = 'solid 1px #000';
                        reportPanel.style.color = '#000';
                        reportPanel.style.fontSize = '12px';
                        reportPanel.style.padding = '10px';
                        reportPanel.style.position = (navigator.userAgent.indexOf('MSIE 6') > -1) ? 'absolute' : 'fixed';
                        reportPanel.style.right = '10px';
                        reportPanel.style.bottom = '10px';
                        reportPanel.style.width = '180px';
                        reportPanel.style.height = '320px';
                        reportPanel.style.overflow = 'auto';
                        reportPanel.style.zIndex = '100000';
                        reportPanel.innerHTML = '&nbsp;';
                        // store a copy of this node in the move buffer
                        document.body.appendChild(reportPanel);
                    }
                    // truncate the queue
                    var reportString = (reportPanel.innerHTML.length < 1000) ? reportPanel.innerHTML : reportPanel.innerHTML.substring(0, 800);
                    // process the arguments
                    for (a = 0, b = arguments.length; a < b; a += 1) {
                        messages += arguments[a] + '<br/>';
                    }
                    // add a break after the message
                    messages += '<hr/>';
                    // output the queue to the panel
                    reportPanel.innerHTML = messages + reportString;
                };
            }
        },

        // allows Object.create (https://gist.github.com/rxgx/1597825)
        objectCreate: function() {
            if (typeof Object.create !== "function") {
                Object.create = function(original) {
                    function Clone() {}
                    Clone.prototype = original;
                    return new Clone();
                };
            }
        },

        // allows String.trim (https://gist.github.com/eliperelman/1035982)
        stringTrim: function() {
            if (!String.prototype.trim) {
                String.prototype.trim = function() {
                    return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
                };
            }
            if (!String.prototype.ltrim) {
                String.prototype.ltrim = function() {
                    return this.replace(/^\s+/, '');
                };
            }
            if (!String.prototype.rtrim) {
                String.prototype.rtrim = function() {
                    return this.replace(/\s+$/, '');
                };
            }
            if (!String.prototype.fulltrim) {
                String.prototype.fulltrim = function() {
                    return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
                };
            }
        },

        // allows localStorage support
        localStorage: function() {
            if (!window.localStorage) {
                if (/MSIE 8|MSIE 7|MSIE 6/i.test(navigator.userAgent)) {
                    window.localStorage = {
                        getItem: function(sKey) {
                            if (!sKey || !this.hasOwnProperty(sKey)) {
                                return null;
                            }
                            return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
                        },
                        key: function(nKeyId) {
                            return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
                        },
                        setItem: function(sKey, sValue) {
                            if (!sKey) {
                                return;
                            }
                            document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
                            this.length = document.cookie.match(/\=/g).length;
                        },
                        length: 0,
                        removeItem: function(sKey) {
                            if (!sKey || !this.hasOwnProperty(sKey)) {
                                return;
                            }
                            document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                            this.length--;
                        },
                        hasOwnProperty: function(sKey) {
                            return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
                        }
                    };
                    window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
                } else {
                    Object.defineProperty(window, "localStorage", new(function() {
                        var aKeys = [],
                            oStorage = {};
                        Object.defineProperty(oStorage, "getItem", {
                            value: function(sKey) {
                                return sKey ? this[sKey] : null;
                            },
                            writable: false,
                            configurable: false,
                            enumerable: false
                        });
                        Object.defineProperty(oStorage, "key", {
                            value: function(nKeyId) {
                                return aKeys[nKeyId];
                            },
                            writable: false,
                            configurable: false,
                            enumerable: false
                        });
                        Object.defineProperty(oStorage, "setItem", {
                            value: function(sKey, sValue) {
                                if (!sKey) {
                                    return;
                                }
                                document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
                            },
                            writable: false,
                            configurable: false,
                            enumerable: false
                        });
                        Object.defineProperty(oStorage, "length", {
                            get: function() {
                                return aKeys.length;
                            },
                            configurable: false,
                            enumerable: false
                        });
                        Object.defineProperty(oStorage, "removeItem", {
                            value: function(sKey) {
                                if (!sKey) {
                                    return;
                                }
                                document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                            },
                            writable: false,
                            configurable: false,
                            enumerable: false
                        });
                        this.get = function() {
                            var iThisIndx;
                            for (var sKey in oStorage) {
                                iThisIndx = aKeys.indexOf(sKey);
                                if (iThisIndx === -1) {
                                    oStorage.setItem(sKey, oStorage[sKey]);
                                } else {
                                    aKeys.splice(iThisIndx, 1);
                                }
                                delete oStorage[sKey];
                            }
                            for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
                                oStorage.removeItem(aKeys[0]);
                            }
                            for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
                                aCouple = aCouples[nIdx].split(/\s*=\s*/);
                                if (aCouple.length > 1) {
                                    oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
                                    aKeys.push(iKey);
                                }
                            }
                            return oStorage;
                        };
                        this.configurable = false;
                        this.enumerable = true;
                    })());
                }
            }
        }

    };

    // startup
    useful.polyfills.html5();
    useful.polyfills.arrayIndexOf();
	useful.polyfills.arrayMap();
    useful.polyfills.querySelectorAll();
    useful.polyfills.addEventListener();
    useful.polyfills.consoleLog();
    useful.polyfills.objectCreate();
    useful.polyfills.stringTrim();
    useful.polyfills.localStorage();

    // return as a require.js module
    if (typeof module !== 'undefined') {
        exports = module.exports = useful.polyfills;
    }

})();

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
useful.Photowall.prototype.Busy = function (parent) {

	// PROPERTIES

	"use strict";
	this.parent = parent;
	this.spinner = null;

	// METHODS

	this.build = function () {
		// construct the spinner
		this.spinner = document.createElement('div');
		this.spinner.className = 'photowall-busy photowall-busy-passive';
		this.parent.element.appendChild(this.spinner);
	};

	this.show = function () {
		// show the spinner
		this.spinner.className = this.spinner.className.replace(/-passive/gi, '-active');
	};

	this.hide = function () {
		// hide the spinner
		this.spinner.className = this.spinner.className.replace(/-active/gi, '-passive');
	};
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photowall.Busy;
}

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
useful.Photowall.prototype.Main = function (config, context) {

    // PROPERTIES

    "use strict";
    this.config = config;
    this.context = context;
    this.element = config.element;

    // OBJECTS

    this.busy = new this.context.Busy(this);
    this.thumbnails = new this.context.Thumbnails(this);

    // METHODS

    this.init = function() {
        var _this = this;
        // communicate the initial state
        this.element.className += ' photowall-passive';
        // store the images
        this.config.images = {};
        this.config.images.links = this.element.getElementsByTagName('a');
        this.config.images.objects = this.element.getElementsByTagName('img');
        // prepare the contents
        this.prepare();
        // construct the spinner
        this.busy.build();
        // check every once in a while to see if the image dimensions are known yet
        this.config.wait = setInterval(function() {
            if (_this.thumbnails.complete()) {
                // cancel the checking
                clearTimeout(_this.config.wait);
                // measure the dimensions
                _this.thumbnails.measure();
                // construct the wall
                _this.thumbnails.redraw();
            }
        }, 500);
        // return the object
        return this;
    };

    this.prepare = function() {
        // remove the white space
        this.element.innerHTML = '<div class="photowall-bricks">' + this.element.innerHTML.replace(/\t|\r|\n/g, '') + '</div>';
        // measure the container
        this.config.col = this.element.offsetWidth;
        this.config.aspect = this.config.height / this.config.col;
    };

};

// return as a require.js module
if (typeof module !== 'undefined') {
    exports = module.exports = useful.Photowall.Main;
}

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
useful.Photowall.prototype.init = function (config) {

	// PROPERTIES

	"use strict";

	// METHODS

	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this).init();
	};

	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context).init();
		}
		// return the instances
		return instances;
	};

	// START

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Photowall;
}
