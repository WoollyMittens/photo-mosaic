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
    this.details = new this.context.Details(this);
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

    this.focus = function(index) {
        // if the input is not a number
        if (isNaN(index)) {
            var a, b,
                name = new RegExp(index, 'i'),
                links = this.config.images.links;
            // find the number that goes with this name
            for (a = 0, b = links.length; a < b; a += 1) {
                if (name.test(links[a].getAttribute('href'))) {
                    index = a;
                }
            }
        }
        // open the popup by number
        this.details.show(index);
    };

};

// return as a require.js module
if (typeof module !== 'undefined') {
    exports = module.exports = useful.Photowall.Main;
}
