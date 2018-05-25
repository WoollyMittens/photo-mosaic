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
