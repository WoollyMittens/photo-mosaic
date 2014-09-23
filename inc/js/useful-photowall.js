/*
	Source:
	van Creij, Maurice (2012). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// object
	useful.Gestures = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		this.lastTouch = null;
		this.touchOrigin = null;
		this.touchProgression = null;
		this.gestureOrigin = null;
		this.gestureProgression = null;
		this.paused = false;
		// methods
		this.start = function () {
			// check the configuration properties
			this.checkConfig(this.cfg);
			// set the required events for mouse
			this.obj.addEventListener('mousedown', this.onStartTouch());
			this.obj.addEventListener('mousemove', this.onChangeTouch());
			document.body.addEventListener('mouseup', this.onEndTouch());
			this.obj.addEventListener('mousewheel', this.onChangeWheel());
			if (navigator.userAgent.match(/firefox/gi)) { this.obj.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
			// set the required events for touch
			this.obj.addEventListener('touchstart', this.onStartTouch());
			this.obj.addEventListener('touchmove', this.onChangeTouch());
			document.body.addEventListener('touchend', this.onEndTouch());
			this.obj.addEventListener('mspointerdown', this.onStartTouch());
			this.obj.addEventListener('mspointermove', this.onChangeTouch());
			document.body.addEventListener('mspointerup', this.onEndTouch());
			// set the required events for gestures
			if ('ongesturestart' in window) {
				this.obj.addEventListener('gesturestart', this.onStartGesture());
				this.obj.addEventListener('gesturechange', this.onChangeGesture());
				this.obj.addEventListener('gestureend', this.onEndGesture());
			} else if ('msgesturestart' in window) {
				this.obj.addEventListener('msgesturestart', this.onStartGesture());
				this.obj.addEventListener('msgesturechange', this.onChangeGesture());
				this.obj.addEventListener('msgestureend', this.onEndGesture());
			} else {
				this.obj.addEventListener('touchstart', this.onStartFallback());
				this.obj.addEventListener('touchmove', this.onChangeFallback());
				this.obj.addEventListener('touchend', this.onEndFallback());
			}
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		this.checkConfig = function (config) {
			// add default values for missing ones
			config.threshold = config.threshold || 50;
			config.increment = config.increment || 0.1;
			// cancel all events by default
			if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
			if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
			// add dummy event handlers for missing ones
			config.swipeUp = config.swipeUp || function () {};
			config.swipeLeft = config.swipeLeft || function () {};
			config.swipeRight = config.swipeRight || function () {};
			config.swipeDown = config.swipeDown || function () {};
			config.drag = config.drag || function () {};
			config.pinch = config.pinch || function () {};
			config.twist = config.twist || function () {};
			config.doubleTap = config.doubleTap || function () {};
		};
		this.readEvent = function (event) {
			var coords = {}, offsets;
			// try all likely methods of storing coordinates in an event
			if (event.x !== undefined) {
				coords.x = event.x;
				coords.y = event.y;
			} else if (event.touches && event.touches[0]) {
				coords.x = event.touches[0].pageX;
				coords.y = event.touches[0].pageY;
			} else if (event.pageX !== undefined) {
				coords.x = event.pageX;
				coords.y = event.pageY;
			} else {
				offsets = this.correctOffset(event.target || event.srcElement);
				coords.x = event.layerX + offsets.x;
				coords.y = event.layerY + offsets.y;
			}
			return coords;
		};
		this.correctOffset = function (element) {
			var offsetX = 0, offsetY = 0;
			// if there is an offset
			if (element.offsetParent) {
				// follow the offsets back to the right parent element
				while (element !== this.obj) {
					offsetX += element.offsetLeft;
					offsetY += element.offsetTop;
					element = element.offsetParent;
				}
			}
			// return the offsets
			return { 'x' : offsetX, 'y' : offsetY };
		};
		this.cancelTouch = function (event) {
			if (this.cfg.cancelTouch) {
				event = event || window.event;
				event.preventDefault();
			}
		};
		this.startTouch = function (event) {
			// if the functionality wasn't paused
			if (!this.paused) {
				// get the coordinates from the event
				var coords = this.readEvent(event);
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
				var coords = this.readEvent(event);
				// get the gesture parameters
				this.cfg.drag({
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
					this.cfg.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : event, 'source' : this.touchOrigin.target});
				// if the horizontal motion was the largest
				} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
					// if there was a right swipe
					if (distance.x > this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
					// else if there was a left swipe
					} else if (distance.x < -this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
					}
				// else
				} else {
					// if there was a down swipe
					if (distance.y > this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
					// else if there was an up swipe
					} else if (distance.y < -this.cfg.threshold) {
						// report the associated swipe
						this.cfg.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
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
		this.changeWheel = function (event) {
			// measure the wheel distance
			var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
			// get the coordinates from the event
			var coords = this.readEvent(event);
			// equate wheeling up / down to zooming in / out
			scale = (distance > 0) ? +this.cfg.increment : scale = -this.cfg.increment;
			// report the zoom
			this.cfg.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale,
				'event' : event,
				'source' : event.target || event.srcElement
			});
		};
		this.cancelGesture = function (event) {
			if (this.cfg.cancelGesture) {
				event = event || window.event;
				event.preventDefault();
			}
		};
		this.startGesture = function (event) {
			// if the functionality wasn't paused
			if (!this.paused) {
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
				var coords = this.readEvent(event);
				// get the gesture parameters
				this.cfg.pinch({
					'x' : coords.x,
					'y' : coords.y,
					'scale' : scale - this.gestureProgression.scale,
					'event' : event,
					'target' : this.gestureOrigin.target
				});
				this.cfg.twist({
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
		// fallback functionality
		this.startFallback = function (event) {
			// if the functionality wasn't paused
			if (!this.paused && event.touches.length === 2) {
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
				var coords = this.readEvent(event);
				// calculate the scale factor
				var scale = 0, progression = this.gestureProgression;
				scale += (event.touches[0].pageX - event.touches[1].pageX) / (progression.touches[0].pageX - progression.touches[1].pageX);
				scale += (event.touches[0].pageY - event.touches[1].pageY) / (progression.touches[0].pageY - progression.touches[1].pageY);
				scale = scale - 2;
				// get the gesture parameters
				this.cfg.pinch({
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
		// touch events
		this.onStartTouch = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// handle the event
				context.startTouch(event);
				context.changeTouch(event);
			};
		};
		this.onChangeTouch = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelTouch(event);
				// handle the event
				context.changeTouch(event);
			};
		};
		this.onEndTouch = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// handle the event
				context.endTouch(event);
			};
		};
		// mouse wheel events
		this.onChangeWheel = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelGesture(event);
				// handle the event
				context.changeWheel(event);
			};
		};
		// gesture events
		this.onStartGesture = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// optionally cancel the default behaviour
				context.cancelGesture(event);
				// handle the event
				context.startGesture(event);
				context.changeGesture(event);
			};
		};
		this.onChangeGesture = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// optionally cancel the default behaviour
				context.cancelGesture(event);
				// handle the event
				context.changeGesture(event);
			};
		};
		this.onEndGesture = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// handle the event
				context.endGesture(event);
			};
		};
		// gesture events
		this.onStartFallback = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// optionally cancel the default behaviour
				//context.cancelGesture(event);
				// handle the event
				context.startFallback(event);
				context.changeFallback(event);
			};
		};
		this.onChangeFallback = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// optionally cancel the default behaviour
				context.cancelGesture(event);
				// handle the event
				context.changeFallback(event);
			};
		};
		this.onEndFallback = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// handle the event
				context.endGesture(event);
			};
		};
		// external API
		this.enableDefaultTouch = function () {
			this.cfg.cancelTouch = false;
		};
		this.disableDefaultTouch = function () {
			this.cfg.cancelTouch = true;
		};
		this.enableDefaultGesture = function () {
			this.cfg.cancelGesture = false;
		};
		this.disableDefaultGesture = function () {
			this.cfg.cancelGesture = true;
		};
		// go
		this.start();
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Gestures;
	}

})();

/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.polyfills = {

		// enabled the use of HTML5 elements in Internet Explorer
		html5 : function () {
			var a, b, elementsList;
			elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
			if (navigator.userAgent.match(/msie/gi)) {
				for (a = 0 , b = elementsList.length; a < b; a += 1) {
					document.createElement(elementsList[a]);
				}
			}
		},

		// allow array.indexOf in older browsers
		arrayIndexOf : function () {
			if (!Array.prototype.indexOf) {
				Array.prototype.indexOf = function (obj, start) {
					for (var i = (start || 0), j = this.length; i < j; i += 1) {
						if (this[i] === obj) { return i; }
					}
					return -1;
				};
			}
		},

		// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
		querySelectorAll : function () {
			if (!document.querySelectorAll) {
				document.querySelectorAll = function (a) {
					var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
					return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
				};
			}
		},

		// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
		addEventListener : function () {
			!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
				WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
					var target = this;
					registry.unshift([target, type, listener, function (event) {
						event.currentTarget = target;
						event.preventDefault = function () { event.returnValue = false; };
						event.stopPropagation = function () { event.cancelBubble = true; };
						event.target = event.srcElement || target;
						listener.call(target, event);
					}]);
					this.attachEvent("on" + type, registry[0][3]);
				};
				WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
					for (var index = 0, register; register = registry[index]; ++index) {
						if (register[0] == this && register[1] == type && register[2] == listener) {
							return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
						}
					}
				};
				WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
					return this.fireEvent("on" + eventObject.type, eventObject);
				};
			})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
		},

		// allow console.log
		consoleLog : function () {
			var overrideTest = new RegExp('console-log', 'i');
			if (!window.console || overrideTest.test(document.querySelectorAll('html')[0].className)) {
				window.console = {};
				window.console.log = function () {
					// if the reporting panel doesn't exist
					var a, b, messages = '', reportPanel = document.getElementById('reportPanel');
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
		objectCreate : function () {
			if (typeof Object.create !== "function") {
				Object.create = function (original) {
					function Clone() {}
					Clone.prototype = original;
					return new Clone();
				};
			}
		},

		// allows String.trim (https://gist.github.com/eliperelman/1035982)
		stringTrim : function () {
			if (!String.prototype.trim) {
				String.prototype.trim = function () { return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, ''); };
			}
			if (!String.prototype.ltrim) {
				String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
			}
			if (!String.prototype.rtrim) {
				String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
			}
			if (!String.prototype.fulltrim) {
				String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
			}
		},

		// allows localStorage support
		localStorage : function () {
			if (!window.localStorage) {
				if (/MSIE 8|MSIE 7|MSIE 6/i.test(navigator.userAgent)){
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
	van Creij, Maurice (2012). "useful.photowall.js: Simple photo wall", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Photowall_Busy = function (parent) {
		// properties
		this.parent = parent;
		this.spinner = null;
		// methods
		this.build = function () {
			// construct the spinner
			this.spinner = document.createElement('div');
			this.spinner.className = 'photowall-busy photowall-busy-passive';
			this.parent.obj.appendChild(this.spinner);
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
		exports = module.exports = useful.Photowall_Busy;
	}

})();

/*
	Source:
	van Creij, Maurice (2012). "useful.photowall.js: Simple photo wall", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

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

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Photowall_Details;
	}

})();

/*
	Source:
	van Creij, Maurice (2012). "useful.photowall.js: Simple photo wall", version 20120606, http://www.woollymittens.nl/.

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

/*
	Source:
	van Creij, Maurice (2012). "useful.photowall.js: Simple photo wall", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Photowall = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		// components
		this.busy = new useful.Photowall_Busy(this);
		this.details = new useful.Photowall_Details(this);
		this.thumbnails = new useful.Photowall_Thumbnails(this);
		// methods
		this.start = function () {
			var context = this;
			// communicate the initial state
			this.obj.className += ' photowall-passive';
			// store the images
			this.cfg.images = {};
			this.cfg.images.links = this.obj.getElementsByTagName('a');
			this.cfg.images.objects = this.obj.getElementsByTagName('img');
			// prepare the contents
			this.prepare();
			// construct the spinner
			this.busy.build();
			// check every once in a while to see if the image dimensions are known yet
			this.cfg.wait = setInterval(function () {
				if (context.thumbnails.complete()) {
					// cancel the checking
					clearTimeout(context.cfg.wait);
					// measure the dimensions
					context.thumbnails.measure();
					// construct the wall
					context.thumbnails.redraw();
				}
			}, 500);
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		this.prepare = function () {
			// remove the white space
			this.obj.innerHTML = '<div class="photowall-bricks">' + this.obj.innerHTML.replace(/\t|\r|\n/g, '') + '</div>';
			// measure the container
			this.cfg.col = this.obj.offsetWidth;
			this.cfg.aspect = this.cfg.height / this.cfg.col;
		};
		this.focus = function (index) {
			this.details.show(index);
		};
		// go
		this.start();
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Photowall;
	}

})();
