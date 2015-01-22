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
