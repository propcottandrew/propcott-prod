var Store = local('models/store');

module.exports = function id(counter) {
	this.prototype._id = {
		counter: counter || 'default'
	};

	this.prototype.genId = function(callback, attempt) {
		var incrementer = this;
		if(attempt >= incrementer._AutoIncrement.maxRetries) return callback({MaxRetriesReached: 1});
		Store.increment('counter:' + incrementer._AutoIncrement.counter, function(err, id) {
			if(!err) incrementer.id = id;
			return callback(err);
		});
	};
};
