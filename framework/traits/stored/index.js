var s3 = local('framework/s3');

module.exports = function stored(options) {
	this.prototype._stored = {
		options: options,
		saved: false,
		getDataBucket: function() {
			if(typeof this._stored.options.Bucket == 'function') return this._stored.options.Bucket();
			else return this._stored.options.Bucket;
		},
		getDataKey: function() {
			if(typeof this._stored.options.Key == 'function') return this._stored.options.Key();
			else return this._stored.options.Key;
		}
	};

	this.prototype.importData = function(data) {
		// make more efficient. only use json if string data type
		if(typeof data == 'object') data = JSON.stringify(data);
		data = JSON.parse(data);
		for(var i in data) this[i] = data[i];
	};

	this.prototype.saveData = function(callback) {
		var $this = this;
		$this.emit('data.saving', function(err) {
			s3.putObject({
				Bucket: $this._stored.getDataBucket(),
				Key: $this._stored.getDataKey + '.json',
				Body: $this,
				ContentType: 'application/json'
			}, function(err) {
				if(err) return callback(err);
				$this._stored.saved = true;
				$this.emit('data.saved', callback);
			});
		});
	};

	this.prototype.loadData = function(callback) {
		var $this = this;
		$this.emit('data.loading', function(err) {
			// handle errors
			s3.getObject({
				Bucket: $this._stored.getDataBucket,
				Key: $this._stored.getDataKey + '.json'
			}, function(err, data) {
				if(err) return callback(err);
				if(!data.Body) return callback.error('PropcottNotFound');
				$this.importData(data.Body);
				$this.emit('data.loaded', function(err) {
					if(err) return callback(err);
					$this._stored.saved = true;
					return callback();
				});
			});
		});
	};
};
