# photowall.js: Photo Wall

*DEPRICATION WARNING: the functionality in this script has been superceeded / trivialised by updated web standards.*

The script arranges collections of images into a brick pattern.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="css/photowall.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="js/photowall.js"></script>
```
Or use [Require.js](https://requirejs.org/).

```js
requirejs([
	'js/photowall.js'
], function(Photowall) {
	...
});
```

Or use imported as a component in existing projects.

```js
@import {Photowall} from "js/photowall.js";
```

## How to start the script

```javascript
var photowall = new Photowall({
	'element' : document.getElementById('id')
});
```

**element : {DOM node}** - The target element of the script.

## License

This work is licensed under a [MIT License](https://opensource.org/licenses/MIT). The latest version of this and other scripts by the same author can be found on [Github](https://github.com/WoollyMittens).
