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
	useful.PhotowallBusy = function (parent) {
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
		// go
		this.build();
	};

}(window.useful = window.useful || {}));
