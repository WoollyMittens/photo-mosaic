/*
	Source:
	van Creij, Maurice (2018). "photowall.js: Simple photo wall", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Photowall = function (config) {

		this.only = function (config) {
			// start an instance of the script
			return new this.Main(config, this);
		};

		this.each = function (config) {
			var _config, _context = this, instances = [];
			// for all element
			for (var a = 0, b = config.elements.length; a < b; a += 1) {
				// clone the configuration
				_config = Object.create(config);
				// insert the current element
				_config.element = config.elements[a];
				// start a new instance of the object
				instances[a] = new this.Main(_config, _context);
			}
			// return the instances
			return instances;
		};

		return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Photowall });
if (typeof module != 'undefined') module.exports = Photowall;

// extend the class
Photowall.prototype.Main = function(config, context) {

  // PROPERTIES

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

  this.init();

};
