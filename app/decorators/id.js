var Store = require(app.models.store);

module.exports = function(options) {

	// Set defaults
	options = options || {};
	options.counter = options.counter || 'default';

	// Return decorator
	return function IdDecorator(target) {
		target.genId = function(callback, attempt) {
			Store.increment('counter:' + options.counter, function(err, id) {
				if(!err) this.id = id;
				callback(err);
			}.bind(this));
		};
	};
};
