'use strict';

var Base     = require(app.models.base);
var Propcott = require(app.models.propcott);
var aws      = require(app.aws);
var stored   = require(app.decorators.stored);
var id       = require(app.decorators.id);
var hasher   = require(app.util.hasher);
var dynamo   = require(app.aws).dynamo;
var bcrypt   = require('bcryptjs');

class User extends Base {
	constructor(data) {
		super(data);
		this.defaults({
			created: Date.now(),
			credentials: [],
			propcotts: [],
			supporting: []
		});
	}

	// List all propcotts they support
	supporting(callback) {
		//aws.dynamo.query();
		/*dynamo.query({
			TableName: 'Supporters',
			Item: {
				PropcottId: {N: String(id)},
				UserId: {N: String(this.id)},
				Created: {N: String(Date.now())}
			}
		});*/
	}

	// Add support for a propcott
	support(id, previous, callback) {
		dynamo.putItem({
			TableName: 'Supporters',
			ConditionExpression: 'attribute_not_exists(PropcottId)',
			Item: {
				PropcottId: {N: String(id)},
				UserId: {N: String(this.id)},
				Created: {N: String(Date.now())},
				Previous: {BOOL: !!previous}
			}
		}, err => {
			if(err) console.error(err); // todo
			else {
				var params = {
					support: {
						daily: '#+1',
						weekly: '#+1',
						monthly: '#+1',
						all: '#+1'
					}
				};

				if(previous) params.support.previous = '#+1';

				Propcott.index.update({hash: 0, range: id}, params, err => err && console.error(err));
			}
			callback();
		});
	}

	// Do they support a propcott?
	supports(id, callback) {
		dynamo.getItem({
			TableName: 'Supporters',
			Key: {
				PropcottId: {N: String(id)},
				UserId: {N: String(this.id)}
			}
		}, (err, data) => {
			callback(err, !!data.Item);
		});
	}

	authenticate(password) {
		return this.credentials.some(v => bcrypt.compareSync(password, v._password));
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
			display_name : this.display_name,
			avatar       : this.avatar && {url: this.avatar},
			notifications: this.notifications,
			permissions  : this.permissions
		};
	}

	static find(provider, key, callback) {
		callback = callback || noop;

		dynamo.getItem({
			TableName: User.table,
			Key: {
				Key: {S: key},
				Provider: {S: provider},
			}
		}, function(err, data) {
			if(err)             return callback(err);
			else if(!data.Item) return callback('User not found');
			
			var user = new User({id: data.Item.Id.N});
			var cred = {
				provider: provider,
				key: key
			};
			if(data.Item.Password) cred._password = data.Item.Password.S
			user.credentials.push(cred);
			callback(null, user);
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
		}, err => err && console.error(err));
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
				if(err) console.error(err);
				else delete user._state.changedCredentials[i];
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
				if(err) console.error(err);
				else delete c._state;
			});
		}
	});
});

module.exports = User;
