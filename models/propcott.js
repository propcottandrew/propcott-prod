var dynamo = local('framework/DynamoDB');
var s3 = local('framework/S3');
var Store = local('models/store');

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

function Propcott(req) {
	this._state = {
		req: req
	};
	this.id = null;
	this.status = 'Draft';
}

Propcott.prototype.indexedProperties = [
	'industry',
	'target'
];

/*
what if we want to load info without loading index?
*/

Propcott.prototype.load = function(callback) {
	var propcott = this;
	if(propcott.id === null) return callback('Propcott not yet saved.');

	propcott.indexedProperties.forEach(function(prop) {
		propcott._state[prop] = propcott.prop;
	});

	var params = {
		Bucket: settings.bucket,
		Key: hash.to(propcott.id) + '/data.json'
	};

	s3.getObject(params, function(err, data) {
		if (err) return callback(err);

		// should load all data into current propcott

		callback(null, data);
	});
};

var save = function(callback) {
	callback = callback || noop;

	var params = {
		Bucket: settings.bucket,
		Key: hash.to(this.id) + '/data.json',
		Body: JSON.stringify(this),
		ContentType: 'application/json'
	};

	s3.putObject(params, function(err, data) {
		if (err) return callback(err);
		callback(null, data);
	});
};

var index = function(callback) {
	callback = callback || noop;

	var params = {
		TableName: 'Propcotts',
		Item: {
			Status: {S: this.status},
			Id: {N: this.id},
			SDay: {N: 1},
			SWeek: {N: 1},
			SMonth: {N: 1},
			SAll: {N: 1},
			SPrevious: {N: 1},
			Industry: {S: this.industry},
			Target: {S: this.target}
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
		if !id, get id
		index if changed
	else
		set draft flag in session
		save to drafts/{this._state.req.sessionId}.json in s3
		flash "Please log in to save your draft."
		redirect to login page


	if published
		if !id, get id
		index if changed
		save to s3
	else



*/

Propcott.prototype.save = function(callback) {
	var propcott = this;

	if(propcott.id === null) {
		Store.increment(settings.counter, function(err, id) {
			if(err) return callback(err);

			propcott.id = id;
			save.apply(propcott, arguments);
		});
	} else save.apply(propcott, arguments);
};

Propcott.prototype.delete = function(callback) {
	if(this.id === null) return callback('Propcott not yet saved.');
};

Propcott.find = function(id, callback) {};
Propcott.load = function(id, callback) {};
Propcott.each = function(id, callback) {};
Propcott.eachByCreated = function(options, callback) {};
Propcott.eachBySupport = function(options, callback) {};
Propcott.eachByDailySupport = function(options, callback) {};
Propcott.eachByWeeklySupport = function(options, callback) {};
Propcott.eachByMonthlySupport = function(options, callback) {};

module.exports = Propcott;
