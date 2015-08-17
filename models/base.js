/*
todo
----
Allow multiple constructors of the same name & anonymous named constructors
*/

function Base() {}

var globalEvents = {};

Base.prototype.emit = function(event) {
	var events = (((this._state||{}).events||{})[event]||[])
		.concat(((globalEvents[this.constructor.name]||{})[event]||[]));
	for(var i = 0; i < events.length; i++) events[i](this);
};

Base.prototype.on = function(event, callback) {
	var events;
	if(this == this.constructor.prototype) {
		// called globally
		if(!globalEvents[this.constructor.name]) globalEvents[this.constructor.name] = {};
		if(!globalEvents[this.constructor.name][event]) globalEvents[this.constructor.name][event] = [];
		events = globalEvents[this.constructor.name][event];
	} else {
		// called on single object
		if(!this._state) this._state = {};
		if(!this._state.events) this._state.events = {};
		if(!this._state.events[event]) this._state.events[event] = [];
		events = this._state.events[event];
	}
	
	events.push(callback);
};

module.exports = Base;
