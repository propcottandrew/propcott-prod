/*var dynamo = local('framework/dynamo');
var s3 = local('framework/s3');
var Store = local('models/store');
var Model = local('models/base');
var fs = require('fs');
var uuid = require('uuid');
var hasher = local('framework/hasher');*/

import Base from app.models.base;

@stored({
	Bucket: (propcott.id ? 'propcotts' : 'drafts') + '.data.propcott.com',
	Key: (propcott.id || propcott.draftId) + (propcott.id ? '/data' : '') + '.json'
})
@indexed({TableName: 'Propcotts'})
@id('propcotts')
@json()
@timestamp()
export class Propcott extends Base {
	constructor(data) {
		this._saved = false;
		this._indexed = false;
		this.published = false;
		this.created = Date.now();
		if(data) this.import(data);
	}

	ensureId(callback) {
		var propcott = this;
		if(propcott.id || propcott.draftId && !propcott.published) return callback();
		if(propcott.published) {
			if(!propcott.id) return propcott.genId(callback);
		} else {
			if(propcott.creator) propcott.draftId = hasher.to(propcott.creator.id) + '/' + uuid.v4();
			else propcott.draftId = uuid.v4();
		}
		return callback();
	}

	// Iterate through a list of IDs of matching propcotts
	static list(options, iterator, callback) {

	}

	// Iterate through matching propcotts
	static each(options, iterator, callback) {
		// should utilize list
	}

	static gen*(options) {

	}
}



Propcott.query(null, function(propcott) {

}, function(err) {

});


for (let propcott of Propcott.gen()) {

}


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
