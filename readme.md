## Empire Matrix Keypad

This library will allow your Raspberry pi to read any matrix type keypad.


### Install

```bash
  npm install empire-matrix-keypad --save
```

### Usage

```js
let Keypad = require('empire-matrix-keypad');

let config = {
	map: [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 8],``
		["*", 0, "#"]
	],
	rows: [26, 19, 13, 6],
	cols: [11, 9, 10]
}

let keypad = new Keypad(config);

keypad.on('keyPress', function(key) {
	console.log('Key Pressed: ' + key);
});

keypad.on('enteredPassword', function(password) {
	console.log('Password entered: ' + password);
});

process.on('SIGINT', function(){
	keypad.resetPins();
});
```