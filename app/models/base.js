var async  = require('async');
var events = require(app.decorators.events);

class Base {
	toString() {
		return JSON.stringify(this);
	}

	save(callback) {
		async.series([
			function(callback) { this.emit('saving', callback); }.bind(this),
			function(callback) { if(!this._stored)  return callback(); this.saveData (callback); }.bind(this),
			function(callback) { if(!this._indexed) return callback(); this.saveIndex(callback); }.bind(this),
			function(callback) { this.emit('saved', callback); }.bind(this)
		], function(err) {
			return callback(err);
		});
	}

	load(callback) {
		async.series([
			function(callback) { this.emit('loading', callback); }.bind(this),
			function(callback) { if(!this._stored)  return callback(); this.loadData (callback); }.bind(this),
			function(callback) { if(!this._indexed) return callback(); this.loadIndex(callback); }.bind(this),
			function(callback) { this.emit('loaded', callback); }.bind(this)
		], function(err) {
			return callback(err);
		});
	}

	import(data) {
		// make more efficient. only use json if string data type
		if(typeof data == 'object') data = JSON.stringify(data);
		data = JSON.parse(data);
		for(var i in data) this[i] = data[i];
	}
}

Base.decorate(events());
/*Base.decorate(json({
	replacer: (key, value) => key[0] === '_' && value,
	space: 0
}));*/

module.exports = Base;
