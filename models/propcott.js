var dynamo = local('framework/DynamoDB');
var s3 = local('framework/S3');
var Store = local('models/store');
var Model = local('models/base');
var async = require('async');

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
}

Propcott.inherit(Model);

Propcott.prototype.indexedProperties = [
	'industry',
	'target'
];

Propcott.prototype.toString = function() {
	var state = this._state;
	delete this._state;
	var str = JSON.stringify(this);
	this._state = state;
	return str;
};



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

/*
on save
	if logged in
		if published
			if !id, get id
			index if changed
			save to {hash.to(propcott.id)}/data.json
		else
			save to {hash.to(req.user.id)}/{Date.now()}.json
		if !id, get id
		index if changed
	else
		set draft flag in session
		save to {this._state.req.sessionId}:draft.json
		flash "Please log in to save your draft."
		redirect to login page
*/

Propcott.prototype.save = function(callback) {
	var propcott = this;
	propcott.emit('saving', propcott);

	async.series([
		function(callback) {
			if(!isNaN(propcott.id)) return callback();
			Store.increment(settings.counter, function(err, id) {
				if(err) return callback(err);
				propcott.id = id;

				var params = {
					Bucket: settings.bucket,
					Key: hash.to(propcott.id) + '/data.json',
					Body: String(propcott),
					ContentType: 'application/json'
				};

				s3.putObject(params, function(err, data) {
					if (err) return callback(err);
					propcott.emit('saved', propcott);
					return callback();
				});
			});
		}
	],
	function(err, data) {
		propcott.emit('saved', propcott);
		callback(err, propcott);
	});
};

Propcott.prototype.delete = function(callback) {
	if(this.id === null) return callback('Propcott not yet saved.');
};

Propcott.find = function(id, callback) {
	var params = {
		Bucket: settings.bucket,
		Key: hash.to(id) + '/data.json'
	};

	s3.getObject(params, function(err, data) {
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
