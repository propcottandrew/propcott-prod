var dynamo = local('framework/dynamo');

function errors(err) {
	err = {NoPermission: 'Sorry, you don\'t have permission.'};
	err.NoPermission.catch(function(message) {
		
	});
	err.catch('NoPermission', function() {
		
	});
	callback.withErrors.NoPermission = 'Sorry, you don\'t have permission.';
	callback();
	if(err.uncaught) return callback(err);
}

module.exports = function indexed(options) {
	this.prototype._indexed = {
		options: options,
		saved: false
	};

	this.prototype.saveIndex = function(callback) {
		var $this = this;
		$this.emit('index.saving', function(err) {
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
				propcott.emit('index.saved', function(err) {
					return callback(err, propcott);
				});
			});
		});
	};

	this.prototype.loadIndex = function(callback) {
		var $this = this;
		$this.emit('index.loading', function(err) {
			// handle errors

		});
	};
};
