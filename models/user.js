var dynamo = local('framework/DynamoDB');
var s3 = local('framework/S3');
var Store = local('models/store');
var Model = local('models/base');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

var settings = {
	counter: 'counter:users',
	table: 'Credentials',
	bucket: 'users.data.propcott.com'
};

// convert to base 36 and reverse string for better S3 partitioning.
var hash = {
	to: function(id) {
		var base36 = (id).toString(36);
		for (var i = base36.length - 1, hash = ''; i >= 0; hash += base36[i--]);
		return hash;
	},
	from: function(hash) {
		for (var i = hash.length - 1, id = ''; i >= 0; id += hash[i--]);
		return parseInt(id, 36);
	}
};

function User(object) {
	this.credentials = [];
	this._state = {
		addedCredentials: {},
		changedCredentials: {}
	};
	console.log(this._state);
	for(var i in object) this[i] = object[i];
}

User.inherit(Model);

// Todo: implement this
// These will be put into their own file
User.prototype.separate = ['propcotts'];

User.find = function(provider, key, callback) {
	callback = callback || noop;

	var params = {
		TableName: settings.table,
		Key: {
			Key: {S: key},
			Provider: {S: provider},
		}
	};

	dynamo.getItem(params, function(err, data) {
		if(err) return callback(err);
		if(!data.Item) return callback('User not found');
		return callback(null, new User({id: data.Item.Id.N}));
	});
};

User.prototype.session = function() {
	return {
		id: this.id,
		email: this.email,
		displayName: this.displayName,
		avatar: this.avatar,
		notifications: this.notifications,
		permissions: this.permissions
	};
};

User.prototype.load = function(callback) {
	callback = callback || noop;
	var user = this;

	var params = {
		Bucket: settings.bucket,
		Key: hash.to(user.id) + '/index.json'
	};

	s3.getObject(params, function(err, data) {
		if (err) return callback(err);
		var json = JSON.parse(data.Body);
		for(var i in json) user[i] = json[i];
		callback(null, user);
	});
};

User.prototype.save = function(callback) {
	callback = callback || noop;
	var user = this;
	user.emit('saving', user);

	async.series([
		function(callback) {
			if(user.id) return callback();

			Store.increment(settings.counter, function(err, id) {
				if(err) return callback(err);
				user.id = id;
				return callback();
			});
		},
		function(callback) {
			var tasks = [];
			for(var i in user._state.addedCredentials) (function(i) {
				tasks.push(function(callback) {
					var params = {
						TableName: settings.table,
						Item: {
							Key: {S: user._state.addedCredentials[i].key},
							Provider: {S: user._state.addedCredentials[i].provider},
							Id: {N: user.id.toString()}
						}
					};
					if(user._state.addedCredentials[i].password) params.Item.Password = {S: bcrypt.hashSync(user._state.addedCredentials[i].password)};
					dynamo.putItem(params, function(err, data) {
						if(err) return callback(err);
						delete user._state.addedCredentials[i];
						callback();
					});
				});
			})(i);
			for(var i in user._state.changedCredentials) (function(i) {
				tasks.push(function(callback) {
					var params = {
						TableName: settings.table,
						UpdateExpression: 'SET #key = :key',
						ExpressionAttributeNames: {'#key': 'Key'},
						ExpressionAttributeValues: {':key': {S: user._state.changedCredentials[i].newKey}},
						Key: {
							Key: {S: user._state.changedCredentials[i].oldKey},
							Provider: {S: user._state.changedCredentials[i].provider}
						}
					};
					dynamo.updateItem(params, function(err, data) {
						if(err) return callback(err);
						delete user._state.changedCredentials[i];
						callback();
					});
				});
			})(i);
			async.parallel(tasks, function(err, results) {
				if(err) return callback(err);
				return callback();
			});
		},
		function(callback) {
			var params = {
				Bucket: settings.bucket,
				Key: hash.to(user.id) + '/index.json',
				Body: String(user),
				ContentType: 'application/json'
			};

			s3.putObject(params, function(err, data) {
				if (err) return callback(err);
				user.emit('saved', user);
				callback(null, data);
			});
		}
	],
	function(err, data) {
		if(!err) user.emit('saved', user);
		callback(err, user);
	});
};

User.prototype.delete = function(callback) {
	callback = callback || noop;
	var user = this;
	user.emit('deleting', user);
	async.parallel([
		function(callback) {
			var params = {
				Bucket: settings.bucket,
				Key: hash.to(user.id) + '.json'
			};

			s3.removeObject(params, function(err, data) {
				if (err) return callback(err);
				user.emit('saved', user);
				callback(null, data);
			});
		},
		function(callback) {
			var params = {
				TableName: settings.table,
				Item: {
					Key: {S: user._state.addedCredentials[i].key},
					Provider: {S: user._state.addedCredentials[i].provider},
				}
			};

			if(user._state.addedCredentials[i].password) params.Item.Password = bcrypt.hashSync(user._state.addedCredentials[i].password);

			dynamo.putItem(params, function(err, data) {
				if(err) return callback(err);
				delete user._state.addedCredentials[i];
				callback(null);
			});
		}
	],
	function(err, data) {
		return callback(err, user);
	})
};

User.prototype.link = function(provider, key, password) {
	for(var i = 0; i < this.credentials.length; i++) {
		if(this.credentials[i].provider == provider && this.credentials[i].key == key) {
			return null; // already exists
		}
	}

	this._state.addedCredentials[provider + ':' + key] = {
		provider: provider,
		key: key,
		password: password
	};

	return this.credentials.push({
		provider: provider,
		key: key
	});
};

User.prototype.unlink = function(provider, key) {
	// what if last account?

	delete this._state.addedCredentials[provider + ':' + key];
	this._state.removedCredentials[provider + ':' + key] = {
		provider: provider,
		key: key
	};

	for(var i = 0; i < this.credentials.length; i++) {
		if(this.credentials[i].provider == provider && this.credentials[i].key == key) {
			return this.credentials.splice(i, 1);
		}
	}
};

User.prototype.relink = function(provider, oldKey, newKey) {
	this._state.changedCredentials[provider + ':' + oldKey] = {
		provider: provider,
		oldKey: oldKey,
		newKey: newKey
	};

	for(var i = 0; i < this.credentials.length; i++) {
		if(this.credentials[i].provider == provider && this.credentials[i].key == oldKey) {
			this.credentials.key = newKey;
		}
	}
}

module.exports = User;
