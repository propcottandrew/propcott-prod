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
		if(typeof data == 'string') try {
			data = JSON.parse(data);
		} catch(err) {
			console.error(err);
		}
		
		if(typeof data != 'object')
			return;
		
		(function copy(to, from) {
			Object.getOwnPropertyNames(from)
				.filter(prop => from.hasOwnProperty(prop))
				.forEach(prop => {
					if(typeof from[prop] == 'object' && from[prop] != null) {
						if(typeof to[prop] == 'undefined') {
							if(from[prop].length)
								to[prop] = [];
							else
								to[prop] = {};
						}
						copy(to[prop], from[prop]);
					} else to[prop] = from[prop];
				});
		})(this, data);
	}
}

Base.decorate(events());
/*Base.decorate(json({
	replacer: (key, value) => key[0] === '_' && value,
	space: 0
}));*/

module.exports = Base;
