var async = require('async');

module.exports = function EventEmitter() {
	this.prototype.emit = function(event, callback) {
		var emitter = this == this.constructor.prototype ? this.constructor : this;
		var events = (this.constructor._events||[])[event]||[];
		if(this != this.constructor.prototype) events = events.concat((this._events||[])[event]||[]);
		events.sort(function(a, b) { return a[0] - b[0] });
		async.series(events.map(function(event) {
			return event[1].bind(emitter);
		}), function(err) {
			if(callback) return callback(err);
		});
	};

	this.prototype.on = function(event, callback) {
		var emitter = this == this.constructor.prototype ? this.constructor : this;
		if(!emitter._events) emitter._events = {};
		if(!emitter._events[event]) emitter._events[event] = [];
		emitter._events[event].push([Date.now(), callback]);
	};

	this.prototype.off = function(event, callback) {
		var emitter = this == this.constructor.prototype ? this.constructor : this;
		if(!(emitter._events||{})[event]) return;
		var list = (emitter._events[event]||[]);
		for(var i = 0; i < list.length; i++)
			if(list[i][1] == callback) list.splice(i--, 1);
	};

	this.prototype.once = function(event, callback) {
		var emitter = this;
		emitter.on(event, function self() {
			callback.apply(null, arguments);
			emitter.off(event, self);
		});
	};
};
