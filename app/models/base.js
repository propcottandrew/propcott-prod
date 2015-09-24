var async  = require('async');
var events = require(app.decorators.events);

class Base {
	toString() {
		return JSON.stringify(this);
	}

	import(data) {
		// make more efficient. only use json if string data type
		if(typeof data == 'object') data = JSON.stringify(data);
		data = JSON.parse(data);
		for(var i in data) this[i] = data[i];
	}

	get status() {
		return 'draft';
	}
}

Base.decorate(events());
/*Base.decorate(json({
	replacer: (key, value) => key[0] === '_' && value,
	space: 0
}));*/

module.exports = Base;
