# useful.photowall.js: Photo Wall

The script arranges collections of images into a brick pattern.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=useful-photowall">demo</a>.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/useful-photowall.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/useful-photowall.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
```

## How to start the script

```javascript
var photowall = new useful.Photowall().init({
	'element' : document.getElementById('id'),
	'row' : 150,
	'orphans' : 0,
	'maximise' : true,
	'zoom' : 2,
	'slice' : 'php/imageslice.php?src=../{src}&{size}',
	'fallback' : navigator.userAgent.match(/msie 7|msie 6/gi),
	'opened' : function (image, link) {},
	'closed' : function () {}
});
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**'row' : {integer}** - Average height of rows in pixels.

**'orphans' : {integer}** - Amount of orphaned thumbnails to allow on the last line.

**'maximise' : {boolean}** - If true, creates a popup the size of the entire window for the photos.

**'zoom' : {integer}** - The maximum zoom level of the popup.

**'slice' : {string}** - Optional web-service for resizing images. An example is provided as *./php/imageslice.php*.

**'fallback' : {boolean}** - Use pixels instead of percentages in emergencies.

**'opened' : {function}** - A function to call when an image is opened. The image's and link's DOM objects are passed to it.

**'closed' : {function}** - A function to call then an image is closed.

## How to build the script

This project uses node.js from http://nodejs.org/

This project uses gulp.js from http://gulpjs.com/

The following commands are available for development:
+ `npm install` - Installs the prerequisites.
+ `gulp import` - Re-imports libraries from supporting projects to `./src/libs/` if available under the same folder tree.
+ `gulp dev` - Builds the project for development purposes.
+ `gulp prod` - Builds the project for deployment purposes.
+ `gulp watch` - Continuously recompiles updated files during development sessions.
+ `gulp serve` - Serves the project on a temporary web server at http://localhost:8000/ .

## License

This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
