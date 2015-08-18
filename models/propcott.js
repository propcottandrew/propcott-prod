var dynamo = local('framework/DynamoDB');
var s3 = local('framework/S3');
var Store = local('models/store');
var Model = local('models/base');
var async = require('async');
var User = local('models/user');

var settings = {
	counter: 'counter:propcotts',
	table: 'Propcotts',
	bucket: 'propcotts.data.propcott.com'
};

// convert to base 36 and reverse string for better S3 partitioning.
var hash = {
	to: function(id) {
		var base36 = id.toString(36);
		for (var i = base36.length - 1, hash = ''; i >= 0; hash += base36[i--]);
		return hash;
	},
	from: function(hash) {
		for (var i = hash.length - 1, id = ''; i >= 0; id += hash[i--]);
		return parseInt(id, 36);
	}
};

function Propcott() {
	this._state = {};
	this.status = 'draft';
	this.created = Date.now();
}

Propcott.inherit(Model);


Propcott.prototype.indexedProperties = [
	'industry',
	'target'
];

var index = function(callback) {
	var propcott = this;
	callback = callback || noop;

	var params = {
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
	};

	dynamo.putItem(params, function(err, data) {
		if (err) return callback(err);
		return callback(null, data);
	});
};

// Use middleware so we have acesss to req & res
Propcott.listeners = function(req, res, next) {
	Propcott.saveListener(req, res, next);
	next();
};

Propcott.prototype.save = function(callback) {
	var propcott = this;
	propcott.emit('saving', function(err) {
		if(err) return callback(err, propcott);
		propcott.emit('saved', function(err) {
			return callback(err, propcott);
		});
	});
};

// still need to save propcott info to user
// maybe do that on saved?
Propcott.saveListener = function(req, res, next) {
	User.prototype.on('login', function(next) {
		if(req.session.draft) {
			s3.getObject({
				Bucket: 'drafts.data.propcott.com',
				Key: req.sessionID + '.json'
			}, function(err, data) {
				if(err) return next(err);
				if(!data.Item) return next('Could not find propcott draft.');
				var propcott = new Propcott(data);
				propcott.creator = req.session.user;
				propcott.save(function(err) {
					if(err) return next(err);
					return next();
				});
			});
		}
	});

	Propcott.prototype.on('saving', function(next) {
		var propcott = this;

		if(!req.session.user) {
			req.session.draft = true;

			s3.putObject({
				Bucket: 'drafts.data.propcott.com',
				Key: req.sessionID + '.json',
				Body: propcott,
				ContentType: 'application/json'
			}, function(err, data) {
				if(err) {
					req.flash('An error occured when saving your propcott draft.');
					return res.redirect('back');
				}
				req.flash('Please log in to save your propcott.');
				res.redirect('/login');
			});
		}

		switch(propcott.status) {
			case 'unpublished':
				s3.putObject({
					Bucket: 'drafts.data.propcott.com',
					Key: hash.to(req.session.user.id) + '/' + propcott.created + '.json',
					Body: propcott,
					ContentType: 'application/json'
				}, function(err, data) {
					if(err) return next(err);
					return next();
				});
			break;

			case 'published':
				async.series([
					function(next) {
						if(propcott.id) return next();
						Store.increment('counter:propcotts', function(err, id) {
							if(err) return next(err);
							propcott.id = id;
							return next();
						});
					}
				], function(err) {
					if(err) return next(err);
					s3.putObject({
						Bucket: 'propcotts.data.propcott.com',
						Key: hash.to(propcott.id) + '/data.json',
						Body: propcott,
						ContentType: 'application/json'
					}, function(err, data) {
						if(err) return next(err);
						return next();
					});
				});
			break;
		}
	});
	next();
};

Propcott.prototype.delete = function(callback) {
	if(this.id === null) return callback('Propcott not yet saved.');
};

Propcott.find = function(id, callback) {
	s3.getObject({
		Bucket: settings.bucket,
		Key: hash.to(id) + '/data.json'
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

module.exports = Propcott;
