var s3 = local('framework/S3');

Propcott.prototype.on('saving', function(callback) {
	var propcott = this;
	propcott.ensureId(function(err) {
		propcott._Stored.Key = (propcott.id || propcott.draftId) + (propcott.id ? '/data' : '') + '.json'
		callback(err);
	});
});

module.exports = function Stored(options) {
	this.prototype._Stored = options;

	this.prototype.saveData = function(callback) {
		var $this = this;
		$this.emit('saving', function(err) {
			s3.putObject({
				Bucket: $this._Stored.Bucket,
				Key: $this._Stored.Key,
				Body: $this,
				ContentType: 'application/json'
			}, callback);
		});
		propcott.ensureId(function(err) {
			if(err) return callback(err);
			s3.putObject({
				Bucket: (propcott.id ? 'propcotts' : 'drafts') + '.data.propcott.com',
				Key: (propcott.id || propcott.draftId) + (propcott.id ? '/data' : '') + '.json',
				Body: propcott,
				ContentType: 'application/json'
			}, function(err) {
				if(err) return callback(err);
				if(!propcott.creator) return callback({SavedAsDraft: propcott.draftId});
				callback();
			});
		});
	};
};
