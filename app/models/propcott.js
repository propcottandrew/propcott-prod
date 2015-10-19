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
			created  : new Date(),
			modified : new Date()
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

Propcott.each({
	hash: {type: '0'},
	range: {created: {between: [0, Date.now()]}},
	forward: true,
	filter: '',
	skip: 10 // start returning the 11th item
}, (p, control) => {
	control.stop();
	// or...
	control.wait();
	setTimeout((() => control.next()), 500);
});

// Decorators
Propcott.decorate(id({counter: 'propcotts'}));
Propcott.decorate(indexed(require(app.models.indexes.propcott)));
Propcott.decorate(stored({
	bucket  : p => (p.id ? 'propcotts' : 'drafts') + '.data.propcott.com',
	key     : p => (p.id ? hasher.to(p.id) : p.draftId) + '/index.json',
	separate : ['updates']
}));

// Events
Propcott.prototype.on('saving', (p, callback) => {
	if(p.id || p.draftId && !p.published) return callback();
	if(p.published) return p.genId(callback);
	else if(p.creator) p.draftId = hasher.to(p.creator.id) + '-drafts/' + uuid.v4();
	else               p.draftId = uuid.v4();
	callback();
});

Propcott.prototype.on('saved', (p, callback) => {
	p._saved = true;
	if(!p.creator && p.draftId) callback('SavedAsDraft');
	else                        callback();
});

Propcott.prototype.on('saved', (p, callback) => {
	callback(); // defer

	// Save successful, index that shit
	/*
	Status		String	Primary Hash
	Id			Number	Primary Range
						Global 1 Hash (SAll, SPrevious)
	SDay		Number	Local Range
	SWeek		Number	Local Range
	SMonth		Number	Local Range
	SAll		Number	Local Range
	SPrevious	Number
	Industry	String
	Target		String
	*/
});

Propcott.prototype.on('loading', (p, callback) => {
	if(!(p.id || p.draftId)) return callback('NotYetSaved');
	callback();
});

Propcott.prototype.on('loaded', (p, callback) => {
	p.loaded = true;
	callback();
});

// Export
module.exports = Propcott;
