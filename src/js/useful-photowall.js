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
