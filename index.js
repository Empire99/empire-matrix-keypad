var Gpio = require('onoff').Gpio;
var EventEmitter = require('events').EventEmitter;

class Keypad extends EventEmitter {
	
	constructor(config) {
		super();
		
		this.columnPressed = 0;
		this.pressedKeys = "";
		this.pins = {};
		this.config = config;
		
		this.phase1();
	}
	
	phase1() {
		for (let index = 0; index < this.config.rows.length; ++index) {
			let gpio = this.config.rows[index];
			this.pins[gpio] = new Gpio(gpio, 'out');
			this.pins[gpio].writeSync(1);
		}

		for (let index = 0; index < this.config.cols.length; ++index) {
			let gpio = this.config.cols[index];
			this.pins[gpio] = new Gpio(gpio, 'in', 'rising');
			this.setColWatcher(gpio);
		}
	}

	phase2() {
		for (let index = 0; index < this.config.rows.length; ++index) {
			let gpio = this.config.rows[index];
			this.pins[gpio].writeSync(0);
			this.pins[gpio].unexport();
		}
		
		for (let index = 0; index < this.config.cols.length; ++index) {
			let gpio = this.config.cols[index];
			this.pins[gpio].unexport();
		}
		
		for (let index = 0; index < this.config.rows.length; ++index) {
			let gpio = this.config.rows[index];
			this.pins[gpio] = new Gpio(gpio, 'in', 'rising');
			this.setRowWatcher(gpio);
		}
		
		for (let index = 0; index < this.config.cols.length; ++index) {
			let gpio = this.config.cols[index];
			this.pins[gpio] = new Gpio(gpio, 'out');
			this.pins[gpio].writeSync(1);
		}
	}

	setColWatcher(gpio) {
		let _this = this;
		this.pins[gpio].watch(function (err, value) {
			_this.getCol(gpio);
		});
	}

	setRowWatcher(gpio) {
		let _this = this;
		this.pins[gpio].watch(function (err, value) {
			_this.getRow(gpio);
		});
	}

	getCol(col) {
		let index = this.getKeyByValue(this.config.cols, col);
		this.columnPressed = index;
		this.phase2();
	}

	getRow(row) {
		let index = this.getKeyByValue(this.config.rows, row);
		this.keyPressed = this.config.map[index][this.columnPressed];
		let key = this.keyPressed;
		this.pressedKeys = this.pressedKeys + "" + this.keyPressed;
	
		this.emit('keyPress', key);

		if(this.keyPressed == "*"){
			this.pressedKeys = "";
		}

		if(this.pressedKeys.length == 4) {
			this.emit('enteredPassword', this.pressedKeys);
			this.pressedKeys = "";
		}

		this.resetPins();
		this.phase1();
	}

	resetPins(){
		for (let index = 0; index < this.config.rows.length; ++index) {
			let gpio = this.config.rows[index];
			this.pins[gpio].unexport();
		}
		
		for (let index = 0; index < this.config.cols.length; ++index) {
			let gpio = this.config.cols[index];
			this.pins[gpio].writeSync(0);
			this.pins[gpio].unexport();
		}
	}

	getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}
	
}

module.exports = Keypad;