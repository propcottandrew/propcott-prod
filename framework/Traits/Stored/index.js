var s3 = local('framework/s3');

module.exports = function stored(options) {
	this.prototype._stored = {
		options: options,
		saved: false
	};

	this.prototype.importData = function(data) {
		// make more efficient. only use json if string data type
		if(typeof data == 'object') data = JSON.stringify(data);
		data = JSON.parse(data);
		for(var i in data) this[i] = data[i];
	};

	this.prototype.saveData = function(callback) {
		var $this = this;
		$this.emit('savingData', function(err) {
			s3.putObject({
				Bucket: $this._stored.Bucket,
				Key: $this._stored.Key + '.json',
				Body: $this,
				ContentType: 'application/json'
			}, function(err) {
				if(err) return callback(err);
				$this._stored.saved = true;
				$this.emit('savedData', callback);
			});
		});
	};

	this.prototype.loadData = function(callback) {
		var $this = this;
		$this.emit('loadingData', function(err) {
			// handle errors
			s3.getObject({
				Bucket: $this._stored.Bucket,
				Key: $this._stored.Key + '.json'
			}, function(err, data) {
				if(err) return callback(err);
				if(!data.Body) return callback.error('PropcottNotFound');
				$this.importData(data.Body);
				$this.emit('loadedData', function(err) {
					if(err) return callback(err);
					$this._stored.saved = true;
					return callback();
				});
			});
		});
	};
};
