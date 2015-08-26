var dynamo = local('framework/dynamo');

module.exports = function indexed(options) {
	this.prototype._indexed = {
		options: options,
		saved: false
	};

	this.prototype.saveIndex = function(callback) {
		var $this = this;
		$this.emit('savingIndex', function(err) {
			// handle errors
			dynamo.putItem({
				TableName: $this._indexed.options.TableName,
				Item: {
					Status: {S: 'published'},
					Id: {N: propcott.id},
					SDay: {N: 1},
					SWeek: {N: 1},
					SMonth: {N: 1},
					SAll: {N: 1},
					SPrevious: {N: 1},
					Industry: {S: propcott.industry},
					Target: {S: propcott.target}
				}
			}, function(err, data) {
				if(err) return callback(err);
				propcott.emit('savedIndex', function(err) {
					return callback(err, propcott);
				});
			});
		});
	};

	this.prototype.loadIndex = function(callback) {
		var $this = this;
		$this.emit('loadingIndex', function(err) {
			// handle errors

		});
	};
};
