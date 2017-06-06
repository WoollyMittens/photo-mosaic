/*
	Source:
	van Creij, Maurice (2014). "useful.photowall.js: Simple photo wall", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Photowall = useful.Photowall || function() {};

// extend the constructor
useful.Photowall.prototype.Main = function(config, context) {

  // PROPERTIES

  "use strict";
  this.config = config;
  this.context = context;
  this.element = config.element;

  // METHODS

  this.init = function() {
    // find all the links
    var photos = this.element.getElementsByTagName('img');
    // process all photos
    for (var a = 0, b = photos.length; a < b; a += 1) {
      // move the image to the tile's background
      photos[a].style.visibility = 'hidden';
      photos[a].parentNode.style.backgroundImage = "url('" + photos[a].getAttribute('src') + "')";
    }
    // return the object
    return this;
  };

};

// return as a require.js module
if (typeof module !== 'undefined') {
  exports = module.exports = useful.Photowall.Main;
}
