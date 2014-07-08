/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var polyfills = polyfills || {};

	// enabled the use of HTML5 elements in Internet Explorer
	polyfills.html5 = function () {
		var a, b, elementsList;
		elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
		if (navigator.userAgent.match(/msie/gi)) {
			for (a = 0 , b = elementsList.length; a < b; a += 1) {
				document.createElement(elementsList[a]);
			}
		}
	};

	// allow array.indexOf in older browsers
	polyfills.arrayIndexOf = function () {
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function (obj, start) {
				for (var i = (start || 0), j = this.length; i < j; i += 1) {
					if (this[i] === obj) { return i; }
				}
				return -1;
			};
		}
	};

	// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
	polyfills.querySelectorAll = function () {
		if (!document.querySelectorAll) {
			document.querySelectorAll = function (a) {
				var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
				return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
			};
		}
	};

	// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
	polyfills.addEventListener = function () {
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
	};

	// allow console.log
	polyfills.consoleLog = function () {
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
	};

	// allows Object.create (https://gist.github.com/rxgx/1597825)
	polyfills.objectCreate = function () {
		if (typeof Object.create !== "function") {
			Object.create = function (original) {
				function Clone() {}
				Clone.prototype = original;
				return new Clone();
			};
		}
	};

	// allows String.trim (https://gist.github.com/eliperelman/1035982)
	polyfills.stringTrim = function () {
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
	};

	// for immediate use
	polyfills.html5();
	polyfills.arrayIndexOf();
	polyfills.querySelectorAll();
	polyfills.addEventListener();
	polyfills.consoleLog();
	polyfills.objectCreate();
	polyfills.stringTrim();

}(window.useful = window.useful || {}));

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

}(window.useful = window.useful || {}));

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

}(window.useful = window.useful || {}));

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

}(window.useful = window.useful || {}));
