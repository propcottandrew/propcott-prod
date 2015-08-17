module.exports = function(value) {
	value.prototype.emit = function(event) {
		var events = (this.constructor._events||[])[event]||[];
		if(this != this.constructor.prototype) events = events.concat((this._events||[])[event]||[]);
		events.sort(function(a, b) { return a[0] - b[0] });
		for(var i = 0; i < events.length; i++) events[i][1](this != this.constructor.prototype && this || null, this.constructor);
	};

	value.prototype.on = function(event, callback) {
		var emitter = this == this.constructor.prototype ? this.constructor : this;
		if(!emitter._events) emitter._events = {};
		if(!emitter._events[event]) emitter._events[event] = [];
		emitter._events[event].push([Date.now(), callback]);
	};

	value.prototype.off = function(event, callback) {
		var emitter = this == this.constructor.prototype ? this.constructor : this;
		if(!(emitter._events||{})[event]) return;
		var list = (emitter._events[event]||[]);
		for(var i = 0; i < list.length; i++)
			if(list[i][1] == callback) list.splice(i--, 1);
	};
};
