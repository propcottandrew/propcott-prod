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
		// make more efficient. only use json if string data type
		if(typeof data == 'object') data = JSON.stringify(data);
		data = JSON.parse(data);
		for(var i in data) if(data.hasOwnProperty(i)) this[i] = data[i];
	}
}

Base.decorate(events());
/*Base.decorate(json({
	replacer: (key, value) => key[0] === '_' && value,
	space: 0
}));*/

module.exports = Base;
