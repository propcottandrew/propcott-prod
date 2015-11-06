'use strict';

/*
var dynamo = local('framework/dynamo');
var s3 = local('framework/s3');
var Store = local('models/store');
var Model = local('models/base');
var fs = require('fs');
var hasher = local('framework/hasher');
*/

var Base    = require(app.models.base);
var aws     = require(app.aws);
var stored  = require(app.decorators.stored);
var indexed = require(app.decorators.indexed.index);
var id      = require(app.decorators.id);
var hasher  = require(app.util.hasher);
var uuid    = require('uuid');

const privates = new WeakMap();

class Propcott extends Base {
	constructor(data) {
		super(data);
		privates.set(this, {});
		
		this.defaults({
			published: false,
			created  : Date.now(),
			updates: []
		});
	}

	// if query is null, get all supporters
	supporters(params, callback) {
		params = params || {};
		params.Item = params.Item || {};
		params.TableName = 'Supporters';
		//params.ExpressionAttributeValues = {
		//	':0': {S: }
		//}
		params.KeyConditionExpression = 'PropcottId=';

		dynamo.query({
			TableName: 'Supporters',
			Item: {
				PropcottId: {N: String(id)},
				UserId: {N: String(this.id)},
				Created: {N: String(Date.now())}
			}
		}, err => {
			if(err) console.error(err);
			else {
				Propcott.index.update({hash: 0, range: id}, {
					support: {
						daily: '#+1',
						weekly: '#+1',
						monthly: '#+1',
						all: '#+1'
					}
				}, err => err && console.error(err));
			}
			callback();
		});
	}

	setCreator(user) {
		this.creator = {
			id           : user.id,
			display_name : user.display_name,
			org          : user.org,
			org_link     : user.org_link
		};
	}

	get slug() {
		var priv = privates.get(this);
		if(priv.slug) return priv.slug;

		var maxlen = 75;
		
		return priv.slug = (this.title||'')
			.toLowerCase()
			.replace(/[_]/g, '-')
			.replace(/[^a-zA-Z0-9\s-]/g, '')
			.replace(/\b[a-zA-Z0-9]{1,2}\b/g, '')
			.trim()
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.substr(0, maxlen - String(this.id).length - 1)
			+ '-' + this.id;
	}
	
	get metric() {
		var priv = privates.get(this);
		if(priv.metric) return priv.metric;
		return priv.metric = String(this.support.all)[0] >= 5 ?
			`1${Array(String(this.support.all).length).join('0')}0` :
			`5${Array(String(this.support.all).length).join('0')}`;
	}

	static find(id, callback) {
		Propcott.index.find({hash: '0', range: id}, callback);
	}

	static each(options, iterator /* (propcott, control) */, callback /* (err, ...) */) {

	}
}

/*
only put if not indexed already, otherwise update.
if update, only update changed properties to allow for better parallel processing

to do this, make the compare function actually spit out a difference between the arrays.
then build an update statement based on that difference
*/

Propcott.prototype.status = '0';

// Decorators
Propcott.decorate(id({counter: 'propcotts'}));
Propcott.decorate(indexed(require(app.models.indexes.propcott)));
Propcott.decorate(stored({
	bucket  : p => (p.published ? 'propcotts' : 'drafts') + '.data.propcott.com',
	key     : p => (p.published ? `${hasher.to(p.id)}/index` : (p.creator ? `${hasher.to(p.creator.id)}/` : 'TMP/') + p.draft_id) + '.json'
}));

// Events
Propcott.prototype.on('deleting', (p, callback) => {
	if(!p.published) callback();
	else callback('AlreadyPublished');
});

Propcott.prototype.on('saving', (p, callback) => {
	if(!p.published) {
		if(!p.draft_id) p.draft_id = uuid.v4();
		return callback();
	}
	if(!p.id) p.genId(callback);
	else callback();
});

Propcott.prototype.on('saved', (p, callback) => {
	p._saved = true;
	callback();
});

Propcott.prototype.on('loading', (p, callback) => {
	if(!(p.id || p.draft_id)) callback('NoIdFound');
	else callback();
});

Propcott.prototype.on('loaded', (p, callback) => {
	p._saved = true;
	callback();
});

// Export
module.exports = Propcott;
