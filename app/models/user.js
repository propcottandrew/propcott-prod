var Base   = require(app.models.base);
var aws    = require(app.aws);
var stored = require(app.decorators.stored);
var id     = require(app.decorators.id);
var hasher = require(app.util.hasher);
var dynamo = require(app.aws).dynamo;
var bcrypt = require('bcryptjs');

class User extends Base {
	constructor(data) {
		super(data);
		this.defaults({
			created: Date.now(),
			credentials: []
		});
	}

	// List all propcotts they support
	supporting(callback) {
		//aws.dynamo.query();

	}

	// Add support for a propcott
	support(id, callback) {
		dynamo.putItem({
			TableName: 'Support',
			Item: {

			}
		}, err => {
			if(err) console.error(err);
			else    p._index = p.genIndex();
			callback();
		});
	}

	// Do they support a propcott?
	supports(id, callback) {

	}

	authenticate(password) {
		return this.credentials
			.filter(c => (c.provider  == 'local'))
			.some  (c => (c._password == password));
	}

	link(provider, key, password) {
		// Todo: deal with ones that are already linked
		if(this.credentials.filter((c => (c.provider == provider && c.key == key))).length) return; // already exists

		this.credentials.push({
			provider : provider,
			key      : key,
			_password: password,
			_state   : 'added'
		});
	}

	unlink(provider, key) {
		for(var c, i = 0; i < this.credentials.length; i++) {
			c = this.credentials[i];
			if(c.provider != provider || c.key != key) continue;

			if(!c._state || c._state != 'added') {
				this.credentials.removed = this.credentials.removed || [];
				this.credentials.removed.push(c);
			}
			this.credentials.splice(i--, 1);
		}
	}

	relink(provider, oldKey, newKey) {
		for(var c, i = 0; i < this.credentials.length; i++) {
			c = this.credentials[i];
			if(c.provider != provider || c.key != oldKey) continue;

			if(c._state && c._state == 'added') {
				c.key = newKey;
			} else {
				if(c._state && c._state != 'changed') c._oldKey = oldKey;
				c.key    = newKey;
				c._state = 'changed';
			}
		}
	}

	// Todo
	delete() {}

	session() {
		return {
			id           : this.id,
			email        : this.email,
			displayName  : this.displayName,
			avatar       : this.avatar,
			notifications: this.notifications,
			permissions  : this.permissions
		};
	}

	static find(provider, key, callback) {
		callback = callback || noop;

		dynamo.getItem({
			TableName: settings.table,
			Key: {
				Key: {S: key},
				Provider: {S: provider},
			}
		}, function(err, data) {
			if(err)             callback(err);
			else if(!data.Item) callback('User not found');
			else                callback(null, new User({id: data.Item.Id.N}));
		});
	}
}

User.table = 'Credentials';

User.decorate(id({counter: 'users'}));
User.decorate(stored({
	bucket  : user => 'users.data.propcott.com',
	key     : user => hasher.to(user.id) + '/index.json',
	separate: user => ['propcotts'] // Todo: These will be put into their own file
}));

User.prototype.on('saving', (user, callback) => {
	if(user.id) return callback();
	user.genId(callback);
});

User.prototype.on('saved', (user, callback) => {
	callback();

	(user.credentials.removed||[]).forEach(c => {
		dynamo.deleteItem({
			TableName: User.table,
			Key: {
				Key: {S: c._oldKey || c.key},
				Provider: {S: c.provider}
			}
		}, err => console.log(err));
	});

	user.credentials.forEach(c => {
		if(!c._state) return;

		if(c._state == 'changed') {
			dynamo.updateItem({
				TableName: User.table,
				UpdateExpression: 'SET #key = :key',
				ExpressionAttributeNames: {'#key': 'Key'},
				ExpressionAttributeValues: {':key': {S: c.key}},
				Key: {
					Key: {S: c._oldKey},
					Provider: {S: c.provider}
				}
			}, function(err, data) {
				if(!err) delete user._state.changedCredentials[i];
				console.log(err);
			});
		}

		if(c._state == 'added') {
			var params = {
				TableName: User.table,
				Item: {
					Key     : {S: c.key},
					Provider: {S: c.provider},
					Id      : {N: String(user.id)}
				}
			};

			if(c._password) params.Item.Password = {S: bcrypt.hashSync(c._password)};

			dynamo.putItem(params, function(err, data) {
				if(!err) delete c._state;
				console.log(err);
			});
		}
	});
});

module.exports = User;