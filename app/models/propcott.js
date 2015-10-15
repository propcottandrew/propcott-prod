/*
var dynamo = local('framework/dynamo');
var s3 = local('framework/s3');
var Store = local('models/store');
var Model = local('models/base');
var fs = require('fs');
var hasher = local('framework/hasher');
*/

var Base   = require(app.models.base);
var aws    = require(app.aws);
var stored = require(app.decorators.stored);
var id     = require(app.decorators.id);
var hasher = require(app.util.hasher);
var uuid   = require('uuid');

class Propcott extends Base {
	constructor(data) {
		super(data);
		var t = Date.now();
		this.defaults({
			published: false,
			created  : t,
			modified : t
		});
	}
	
	// if query is null, get all supporters
	supporters(query, callback) {
		
	}
	
	// Iterate through matching propcott ids
	static each(options, iterator, callback) {
		
	}
	
	static find(id, callback) {
		
	}
	
	genIndex() {
		return Propcott.index.watch.map(v => {
			var prop = p, path = v.split('.');
			while(prop && path.length) prop = prop[path.shift()];
			return prop;
		});
	}
}

var compare = (a, b) =>
	a instanceof Array &&
	b instanceof Array &&
	a.length == b.length &&
	a.every((v, i) => v == b[i]);

Propcott.schema = {
	id: Number,
	industry: String,
	target: String,
	support: {
		daily: Number,
		Weekly: Number,
		monthly: Number,
		all: Number
	}
};

/*
translates to...
Item: {
	0: {N: null}
}
*/

Propcott.index = {
	hash : p => '0',
	range: p => p.id,
	watch: ['id', 'industry', 'target']
};

Propcott.prototype.on('loaded', (p, callback) => {
	p._index = p.genIndex();
	callback();
});

Propcott.prototype.on('saving', (p, callback) => {
	// Nothing has changed
	if(compare(p._index, p.genIndex())) return callback();
	
	dynamo.putItem({
		TableName: 'Propcotts',
		Item: {
			Status: {S: 'published'},
			Id: {N: p.id},
			SDay: {N: 1},
			SWeek: {N: 1},
			SMonth: {N: 1},
			SAll: {N: 1},
			SPrevious: {N: 1},
			Industry: {S: p.industry},
			Target: {S: p.target}
		}
	}, err => {
		if(err) console.error(err);
		else    p._index = p.genIndex();
		callback();
	});
});

// Decorators
Propcott.decorate(id({counter: 'propcotts'}));
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

/*
Propcott.each({
	option: 1
}, function(propcott) {
	// iterator
}, function(err) {
	// callback
});

propcott.save(function(err, propcott) {
	if(err) {
		if(err.SavedAsDraft) {
			req.session.draft = err.SavedAsDraft;
			req.flash('Please log in to save your propcott.');
			return res.redirect('/login');
		}
		req.flash('Could not save your propcott.');
		return res.redirect('back');
	}
	// continue
});

Propcott.prototype.saveIndex = function(callback) {
	var propcott = this;
	propcott.ensureId(function(err) {
		if(err) return callback(err);
		if(!propcott.id) return callback.error('NotYetPublished');
		if(propcott._indexed) {
			// check for change to indexed properties
			return callback();
		} else {
			dynamo.putItem({
				TableName: 'Propcotts',
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
				propcott.emit('saved', function(err) {
					return callback(err, propcott);
				});
			});
		}
	});
};

// move these to base model
Propcott.prototype.loadIndex = function(callback) {
	var propcott = this;
	if(!propcott.id) return callback();
	dynamo.getItem({
		TableName: 'Propcotts',
		Key: {
			Status: {S: 'published'},
			Id: {N: propcott.id}
		}
	}, function(err, data) {
		if(err) return callback(err);
		if(!data.Item) return callback({PropcottNotFound:1});
		propcott.support = {
			all: data.Item.SAll.N,
			monthly: data.Item.SMonth.N,
			weekly: data.Item.SWeek.N,
			daily: data.Item.SDay.N,
			previous: data.Item.SPrevious.N
		};
		propcott.industry = data.Item.Industry.S;
		propcott.target = data.Item.Target.S;
		propcott._indexed = true;
		return callback();
	});
};
*/
