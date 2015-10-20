var async = require('async');
var s3    = require(app.aws).s3;

module.exports = options => {

	// Set defaults
	options = options || {};
	if(typeof options.bucket != 'function') options.bucket = (bucket => bucket)(options.bucket);
	if(typeof options.key    != 'function') options.key    = (key    => key   )(options.key   );

	// Return decorator
	return function StoredDecorator(target) {
		target._saved = false;

		target.prototype.save = function(callback) {
			async.series([
				callback => this.emit('saving', callback),
				callback => {
					s3.putObject({
						Bucket     : options.bucket(this),
						Key        : options.key(this),
						Body       : String(this),
						ContentType: 'application/json'
					}, err => {
						if(!err) this._saved = true;
						callback(err);
					});
				},
				callback => this.emit('saved', callback)
			], err => callback && callback(err, this));
		};

		target.prototype.load = function(callback) {
			async.series([
				callback => this.emit('loading', callback),
				callback => {
					s3.getObject({
						Bucket: options.bucket(this),
						Key: options.key(this) + '.json'
					}, (err, data) => {
						if(err)        return callback(err);
						if(!data.Body) return callback('NotFound');
						this._saved = true;
						this.importData(data.Body);
					});
				},
				callback => this.emit('loaded', callback)
			], err => callback && callback(err, this));
		};
	};
};
