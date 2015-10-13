var Store = require(app.models.store);

module.exports = options => {

	// Set defaults
	options = options || {};
	options.counter = 'counter:' + (options.counter || 'default');

	// Return decorator
	return target => {
		target.prototype.genId = function(callback) {
			Store.increment(options.counter, (err, id) => {
				if(!err) this.id = id;
				if(callback) callback(err);
			});
		};
	};
};
