var async = require('async');

module.exports = options => {
	return function EventDecorator(target) {
		//target.emit = () => target.prototype.emit.apply(target, arguments);
		//target.on   = () => target.prototype.on  .apply(target, arguments);
		//target.off  = () => target.prototype.off .apply(target, arguments);
		//target.once = () => target.prototype.once.apply(target, arguments);

		target.prototype.emit = function(event, callback) {
			var events = (this._events||{})[event]||[];
			if(this != this.constructor.prototype && this.hasOwnProperty('_events'))
				events.concat((this.constructor.prototype._events||{})[event]||[]);
			
			events.sort(function(a, b) { return a[0] - b[0] });
			async.series(events.map(event => c => event[1](this, c)), err => {
				if(callback) return callback(err);
			});
		};

		target.prototype.on = function(event, callback) {
			if(!this.hasOwnProperty('_events'))     this._events = {};
			if(!this._events.hasOwnProperty(event)) this._events[event] = [];
			this._events[event].push([Date.now(), callback]);
		};

		target.prototype.off = function(event, callback) {
			if(!((this._events||{})[event]||[]).length) return;
			for(var i = 0; i < this._events.length; i++)
				if(this._events[i][1] == callback) this._events.splice(i--, 1);
		};

		target.prototype.once = function(event, callback) {
			emitter.on(event, function self() {
				callback.apply(null, arguments);
				this.off(event, self.bind(this));
			}.bind(this));
		};
	};
};
