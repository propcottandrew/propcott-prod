'use strict';

var async  = require('async');
var events = require(app.decorators.events);

class Base {
	constructor(data) {
		if(data) this.import(data);
	}
	
	toString() {
		return JSON.stringify(this);
	}
	
	defaults(data) {
		for(var i in data)
			if(!this[i]) this[i] = data[i];
	}

	import(data) {
		// should we make a deep copy?
		if(typeof data == 'string') data = JSON.parse(data);
		for(var i in data) if(data.hasOwnProperty(i)) this[i] = data[i];
	}
}

Base.decorate(events());
/*Base.decorate(json({
	replacer: (key, value) => key[0] === '_' && value,
	space: 0
}));*/

module.exports = Base;
