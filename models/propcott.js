var dynamo = local('framework/DynamoDB');
var s3 = local('framework/S3');
var Store = local('models/store');
var Model = local('models/base');
var fs = require('fs');
var uuid = require('uuid');
var hasher = local('framework/hasher');

var settings = {
	counter: 'counter:propcotts',
	table: 'Propcotts',
	bucket: 'propcotts.data.propcott.com'
};

exports = module.exports = Propcott;
Propcott.inherit(Model);
function Propcott() {
	this._state = {};
	this.status = 'draft';
	this.created = Date.now();
}

Propcott.prototype.indexedProperties = [
	'industry',
	'target'
];

// Use middleware so we have acesss to req & res
Propcott.listeners = function(req, res, next) {
	next();
};

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

Propcott.getDraft = function(callback) {
	s3.getObject({
		Bucket: 'drafts.data.propcott.com',
		Key: req.sessionID + '.json'
	}, function(err, data) {
		if(err) return callback(err);
		if(!data.Item) return callback('Could not find propcott draft.');
		var propcott = new Propcott(data);
		propcott.creator = req.session.user;
		propcott.save(function(err) {
			if(err) return callback(err);
			return callback();
		});
	});
};

Propcott.prototype.save = function(callback) {
	var propcott = this;
	propcott.emit('saving', function(err) {
		if(err) return callback(err, propcott);
		if(!propcott.creator) {
			var id = uuid.v4();
			s3.putObject({
				Bucket: 'drafts.data.propcott.com',
				Key: id + '.json',
				Body: propcott,
				ContentType: 'application/json'
			}, function(err, data) {
				if(err) return callback(err);
				return callback({SavedAsDraft: id}, propcott);
			});
		}

		if(propcott.published) {
			async.series([
				function(callback) {
					if(propcott.id) return callback();
					Store.increment('counter:propcotts', function(err, id) {
						if(err) return callback(err);
						propcott.id = id;
						return callback();
					});
				}
			], function(err) {
				if(err) return callback(err);
				s3.putObject({
					Bucket: 'propcotts.data.propcott.com',
					Key: hasher.to(propcott.id) + '/data.json',
					Body: propcott,
					ContentType: 'application/json'
				}, function(err, data) {
					if(err) return callback(err);
					if(this._state.)
					dynamo.putItem({
						TableName: 'Propcotts',
						Item: {
							Status: {S: propcott.status},
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
				});
			});
		} else {
			s3.putObject({
				Bucket: 'drafts.data.propcott.com',
				Key: hasher.to(propcott.creator.id) + '/' + propcott.created + '.json',
				Body: propcott,
				ContentType: 'application/json'
			}, function(err, data) {
				if(err) return callback(err);
				propcott.emit('saved', function(err) {
					return callback(err, propcott);
				});
			});
		}
	});
};

Propcott.prototype.delete = function(callback) {
	// Todo
	propcott.emit('deleting', function(err) {
		if(err) return callback(err, propcott);
		propcott.emit('deleted', function(err) {
			return callback(err, propcott);
		});
	});
};

Propcott.find = function(id, callback) {
	s3.getObject({
		Bucket: settings.bucket,
		Key: hasher.to(id) + '/data.json'
	}, function(err, data) {
		if(err) return callback(err);
		console.log(data);
		return;

		var propcott = new Propcott();
		for(var i in data)
		callback(null, data);
	});
};

Propcott.each = function(id, callback) {};
Propcott.eachByCreated = function(options, callback) {};
Propcott.eachBySupport = function(options, callback) {};
Propcott.eachByDailySupport = function(options, callback) {};
Propcott.eachByWeeklySupport = function(options, callback) {};
Propcott.eachByMonthlySupport = function(options, callback) {};
