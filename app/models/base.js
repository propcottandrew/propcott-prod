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
		
		if(typeof data == 'string') data = JSON.parse(data);
		
		(function copy(to, from) {
			for(var key in from) {
				if(!from.hasOwnProperty(key)) continue;
				if(typeof from != 'object' || from instanceof Array) // maybe do a merge or something for array? either way we'll need to handle it
					to[key] = from[key];
				else {
					if(typeof to[key] == 'undefined') to[key] = {};
					copy(to[key], from[key]);
				}
			}
		})(this, data);
		
		return;
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
