'use strict';

var Base     = require(app.models.base);
var Propcott = require(app.models.propcott);
var stored   = require(app.decorators.stored);
var id       = require(app.decorators.id);
var hasher   = require(app.util.hasher);
var dynamo   = require(app.aws).dynamo;
var ses      = require(app.aws).ses;
var bcrypt   = require('bcryptjs');
var async    = require('async');
var swig     = require('swig');

class User extends Base {
	constructor(data) {
		super(data);
		this.defaults({
			created: Date.now(),
			credentials: [],
			propcotts: [],
			supporting: [],
			notifications: {
				'join-email': true,
				'publish-email': true,
				'reminders-email': true,
				'reminders-time': 'Weekly'
			}
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

		if(this.email && this.notifications['join-email']) new Propcott({published: true, id: id}).load((err, propcott) => {
			if(err) console.error(err);
			this.sendEmail('join', `Propcotting ${propcott.target}`, {propcott: propcott});
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
				if(!c._state || c._state != 'changed') c._oldKey = oldKey;
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
			username     : this.username,
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
			if(data.Item.Password) cred._password = data.Item.Password.S;
			user.credentials.push(cred);
			callback(null, user);
		});
	}

	sendEmail(event, subject, data, callback) {
		if(!this.email)
			return;
		
		data = data || {};
		data.user = this;
		
		ses.sendEmail({
			Destination: {ToAddresses: [this.email]},
			Message: {
				Body: {
					Html: {
						Data: swig.renderFile(`${app.emails}/${event}.html`, data),
						Charset: 'UTF-8'
					},
					Text: {
						Data: swig.renderFile(`${app.emails}/${event}.txt`, data),
						Charset: 'UTF-8'
					}
				},
				Subject: {
					Data: subject,
					Charset: 'UTF-8'
				}
			},
			Source: 'Propcott <propcott@propcott.com>',
			ReplyToAddresses: ['propcott@propcott.com']
		}, callback || (err => err && console.error(err)));
	}
}

User.table = 'Credentials';

User.decorate(id({counter: 'users'}));
User.decorate(stored({
	bucket  : user => 'users.data.propcott.com',
	key     : user => hasher.to(user.id) + '/index.json',
	separate: user => ['propcotts'] // Todo: These will be put into their own file
}));

User.prototype.on('register', (user, callback) => {
	callback();
	user.sendEmail('register', 'Welcome to Propcott');
});

User.prototype.on('saving', (user, callback) => {
	if(user.id) return callback();
	user.genId(callback);
});

User.prototype.on('saved', (user, callback) => {
	var queue = async.queue((task, next) => task(err => {
		if(!err)
			return next();
		
		queue.kill();
		callback(err);
	}));
	queue.drain = callback;
	queue.push(
		((user.credentials.removed||[]).map(c => callback => {
			dynamo.deleteItem({
				TableName: User.table,
				Key: {
					Key: {S: c._oldKey || c.key},
					Provider: {S: c.provider}
				}
			}, callback);
		}))
		.concat(user.credentials.filter(c => c._state == 'changed').map(c => callback => {
			dynamo.getItem({
				TableName: User.table,
				Key: {
					Key: {S: c._oldKey},
					Provider: {S: c.provider}
				}
			}, (err, data) => {
				if(err)
					return callback(err);
				
				data.Item.Key.S = c.key;
				dynamo.putItem({
					TableName: User.table,
					ConditionExpression: 'attribute_not_exists(#key)',
					ExpressionAttributeNames: {'#key': 'Key'},
					Item: data.Item
				}, err => {
					if(err)
						return callback(err);
					
					dynamo.deleteItem({
						TableName: User.table,
						Key: {
							Key: {S: c._oldKey},
							Provider: {S: c.provider}
						}
					}, err => {
						if(!err) delete c._state;
						callback(err);
					});
				});
			});
		}))
		.concat(user.credentials.filter(c => c._state == 'added').map(c => callback => {
			var params = {
				TableName: User.table,
				ConditionExpression: 'attribute_not_exists(#key)',
				ExpressionAttributeNames: {'#key': 'Key'},
				Item: {
					Key     : {S: c.key},
					Provider: {S: c.provider},
					Id      : {N: String(user.id)}
				}
			};

			if(c._password) params.Item.Password = {S: bcrypt.hashSync(c._password)};

			dynamo.putItem(params, err => {
				if(!err) delete c._state;
				callback(err);
			});
		}))
	);
});

module.exports = User;
