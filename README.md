# useful.photowall.js: Photo Wall

The script arranges collections of images into a brick pattern.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=photowall">photowall demo</a>.

## How to use the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/photowall.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/useful.photowall.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*. To provide an alternative for *document.querySelectorAll* in Internet Explorer 8 and lower, include *jQuery*.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<![endif]-->
```

### Using vanilla JavaScript

This is the safest way of starting the script, but allows for only one target element at a time.

```javascript
var parent = documentGetElementById('id');
useful.photowall.start(parent, {
	'row' : 150,
	'orphans' : 2,
	'slice' : './php/imageslice.php?src=../{src}&width={width}&height={height}',
	'fallback' : navigator.userAgent.match(/msie 7|msie 6/gi),
	'opened' : function (image, link) {},
	'closed' : function () {}
});
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**parent : {DOM node}** - The DOM element around which the functionality is centred.

**'row' : {integer}** - Average height of rows in pixels.

**'orphans' : {integer}** - Amount of orphaned thumbnails to allow on the last line.

**'slice' : {string}** - Optional web-service for resizing images. An example is provided as *./php/imageslice.php*.

**'fallback' : {boolean}** - Use pixels instead of percentages in emergencies.

**'opened' : {function}** - A function to call when an image is opened. The image's and link's DOM objects are passed to it.

**'closed' : {function}** - A function to call then an image is closed.

### Using document.querySelectorAll

This method allows CSS Rules to be used to apply the script to one or more nodes at the same time.

```javascript
useful.css.select({
	rule : 'figure.photowall',
	handler : useful.photowall.start,
	data : {
		'row' : 150,
		'orphans' : 2,
		'slice' : './php/imageslice.php?src=../{src}&width={width}&height={height}'
	}
});
```

**rule : {string}** - The CSS Rule for the intended target(s) of the script.

**handler : {function}** - The public function that starts the script.

**data : {object}** - Name-value pairs with configuration data.

### Using jQuery

This method is similar to the previous one, but uses jQuery for processing the CSS rule.

```javascript
$('figure.photowall').each(function (index, element) {
	useful.photowall.start(element, {
		'row' : 150,
		'orphans' : 2,
		'slice' : './php/imageslice.php?src=../{src}&width={width}&height={height}'
	});
});
```

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
