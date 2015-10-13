var dynamo = local('framework/dynamo');
var s3 = local('framework/s3');
var Store = local('models/store');
var Model = local('models/base');
var fs = require('fs');
var uuid = require('uuid');
var hasher = local('framework/hasher');

exports = module.exports = Propcott;
Propcott.inherit(Model);
Propcott.trait('id')('propcotts');
Propcott.trait('stored', {
	Bucket: (propcott.id ? 'propcotts' : 'drafts') + '.data.propcott.com',
	Key: (propcott.id || propcott.draftId) + (propcott.id ? '/data' : '') + '.json'
});
Propcott.trait('indexed', {
	TableName: 'Propcotts'
});
//Propcott.trait('json');

function Propcott(data) {
	this._saved = false;
	this._indexed = false;
	this.published = false;
	this.created = Date.now();
	if(data) this.import(data);
}

Propcott.prototype.import = function(data) {
	// make more efficient. only use json if string data type
	if(typeof data == 'object') data = JSON.stringify(data);
	data = JSON.parse(data);
	for(var i in data) this[i] = data[i];
};

/*
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
*/

Propcott.prototype.on('savingData', function(callback) {
	var propcott = this;
	propcott.ensureId(function(err) {
		propcott._stored.Key = (propcott.id || propcott.draftId) + (propcott.id ? '/data' : '');
		callback(err);
	});
});

Propcott.prototype.on('savedData', function(callback) {
	if(!this.creator && this.draftId) return callback.error('SavedAsDraft');
	callback();
});

Propcott.prototype.on('loadingData', function(callback) {
	if(!(this.id || this.draftId)) return callback.error('NotYetSaved');
	this._stored.Key = ($this.id || $this.draftId) + ($this.id ? '/data' : '');
	callback();
});

Propcott.prototype.on('savingIndex', function(callback) {
	var propcott = this;
	propcott.ensureId(function(err) {
		if(err) return callback(err);
		if(!propcott.id) return callback.error('NotYetPublished');
		if(propcott._indexed) {
			// check for change to indexed properties
			return callback();
		} else {
			callback();
		}
		//propcott._stored.Key = (propcott.id || propcott.draftId) + (propcott.id ? '/data' : '');
	});
});

Propcott.prototype.ensureId = function(callback) {
	var propcott = this;
	if(propcott.id || propcott.draftId && !propcott.published) return callback();
	if(propcott.published) {
		if(!propcott.id) return propcott.genId(callback);
	} else {
		if(propcott.creator) propcott.draftId = hasher.to(propcott.creator.id) + '/' + uuid.v4();
		else propcott.draftId = uuid.v4();
	}
	return callback();
};

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
// should check if stored and if indexed and call each
// possibly check for id and ensure id there to?
// if no savable traits then return an error
Propcott.prototype.save = function(callback) {
	var propcott = this;
	async.series([
		function(callback) { propcott.emit('saving', callback); },
		propcott.saveData,
		propcott.saveIndex,
		function(callback) { propcott.emit('saved', callback); }
	], function(err) {
		return callback(err);
	});
};

Propcott.prototype.load = function(callback) {
	var propcott = this;
	async.series([
		function(callback) { propcott.emit('loading', callback); },
		propcott.loadIndex,
		propcott.loadData,
		function(callback) { propcott.emit('loaded', callback); }
	], function(err) {
		return callback(err);
	});
};

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

Propcott.list = function(id, callback) {};
Propcott.listByCreated = function(options, callback) {};
Propcott.listBySupport = function(options, callback) {};
Propcott.listByDailySupport = function(options, callback) {};
Propcott.listByWeeklySupport = function(options, callback) {};
Propcott.listByMonthlySupport = function(options, callback) {};
