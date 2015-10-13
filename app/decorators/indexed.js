var async = require('async');
var aws   = require(app.aws);

module.exports = (options) => {

	// Set defaults
	options = options || {};
	//if(typeof options.bucket != 'function') options.bucket = ((bucket) => bucket)(options.bucket);
	//if(typeof options.key    != 'function') options.key    = ((key)    => key   )(options.key   );

	// Return decorator
	return function IndexedDecorator(target) {
		target._saved = false;

		target.save = (callback) => {
			async.series([
				function(callback) { this.emit('saving', callback); }.bind(this),
				function(callback) {
					s3.putObject({
						Bucket: options.bucket.bind(this)(),
						Key: options.key.bind(this)() + '.json',
						Body: this,
						ContentType: 'application/json'
					}, function(err) {
						if(err) return callback(err);
						this._saved = true;
					}.bind(this));
				}.bind(this),
				function(callback) { this.emit('saved', callback); }.bind(this)
			], function(err) {
				callback(err);
			});
		};

		target.load = (callback) => {
			async.series([
				function(callback) { this.emit('loading', callback); }.bind(this),
				function(callback) {
					s3.getObject({
						Bucket: options.bucket.bind(this)(),
						Key: options.key.bind(this)() + '.json'
					}, function(err, data) {
						if(err) return callback(err);
						if(!data.Body) return callback.error('PropcottNotFound');
						this.importData(data.Body);
					}.bind(this));
				}.bind(this),
				function(callback) { this.emit('loaded', callback); }.bind(this)
			], function(err) {
				this._saved = true;
				callback(err);
			}.bind(this));
		};
		
		// Iterate through matching items
		target.query = (options, iterator, callback) => {
			
		};
		
		target.get = (options, callback) => {
			
		};
	};
};
