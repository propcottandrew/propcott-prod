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
var indexed = require(app.decorators.indexed.toString());
var id      = require(app.decorators.id);
var hasher  = require(app.util.hasher);
var uuid    = require('uuid');

class Propcott extends Base {
	constructor(data) {
		super(data);
		this.defaults({
			published: false,
			created  : Date.now(),
			modified : Date.now()
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
		params.KeyConditionExpression = 'PropcottId='

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
				}, (err, p) => {
					console.log(err, p);
				});
			}
			callback();
		});
	}
	
	setCreator(user) {
		this.creator = {
			id      : user.id,
			name    : user.displayName,
			org     : user.org,
			org_link: user.org_link
		};
	}
	
	slug() {
		return `${this.id}-${this.title.toLowerCase().trim().replace(/\s+/g, '-').substr(0,75)}`;
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
	key     : p => (p.published ? `${hasher.to(p.id)}/index` : p.draftId) + '.json'
}));

// Events
Propcott.prototype.on('deleting', (p, callback) => {
	if(!p.published) callback();
	else callback('AlreadyPublished');
});

Propcott.prototype.on('saving', (p, callback) => {
	if(!p.puslished) {
		if(!p.draftId) {
			if(p.creator) p.draftId = uuid.v4();
			else p.draftId = 'expire/' + uuid.v4();
		}
		
		return callback();
	}
	
	if(!p.id) p.genId(callback);
	else callback();
});

Propcott.prototype.on('saved', (p, callback) => {
	p._saved = true;
	if(p.draftId) callback('SavedAsDraft');
	else callback();
});

Propcott.prototype.on('loading', (p, callback) => {
	if(!(p.id || p.draftId)) callback('NoIdFound');
	else callback();
});

Propcott.prototype.on('loaded', (p, callback) => {
	p.loaded = true;
	callback();
});

// Export
module.exports = Propcott;
