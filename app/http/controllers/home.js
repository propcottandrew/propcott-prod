var Propcott = require(app.models.propcott);
var async    = require('async');

var featured = 8;

var indexOn = (index, callback) => {
	var i = 0;
	var tasks = [];
	
	Propcott.index.query({
		TableName: 'Propcotts',
		IndexName: `${index}-index`,
		ScanIndexForward: false,
		ExpressionAttributeNames: {'#0': '0', '#1': '1'},
		ExpressionAttributeValues: {':0': {S: '0'}, ':1': {N: String(featured)}},
		KeyConditionExpression: '#0=:0',
		FilterExpression: '#1<>:1',
		Limit: 4
	}, index => {
		if(i++ >= 4) return;
		tasks.push(callback => new Propcott({published: true, id: index.id}).load((err, propcott) => {
			propcott.import(index);
			callback(null, propcott);
		}));
	}, err => {
		if(err) return callback(err);
		async.parallel(tasks, (err, results) => {
			return callback(err, results);
		});
	});
};

module.exports = (req, res) => {
	async.parallel({
		recent:   callback => indexOn(4, callback),
		hot:      callback => indexOn(8, callback),
		featured: callback => Propcott.find(featured, (err, index) => {
			if(err) return callback(err);
			new Propcott({published: true, id: featured}).load((err, propcott) => {
				if(err) return callback(err);
				propcott.import(index);
				callback(null, propcott);
			});
		})
	}, (err, results) => {
		console.log(results.featured);
		res.render('home', results);
	});
	
	/*
	var tasks = [];
	async.parallel({
		hot: callback => {
			var ids = [];
			var i = 0;
			Propcott.index.query({
				TableName: 'Propcotts',
				IndexName: '8-index',
				ScanIndexForward: false,
				ExpressionAttributeNames: {'#0': '0', '#1': '1'},
				ExpressionAttributeValues: {':0': {S: '0'}, ':1': {N: String(featured)}},
				KeyConditionExpression: '#0=:0',
				FilterExpression: '#1<>:1',
				Limit: 5
			}, index => {
				console.log('hot', index.id);
				if(i++ >= 5) return;
				ids.push(index.id);
			}, err => {
				return callback(err, ids);
			});
		},
		new: callback => {
			var propcotts = [];
			var i = 0;
			Propcott.index.query({
				TableName: 'Propcotts',
				IndexName: '4-index',
				ScanIndexForward: false,
				ExpressionAttributeNames: {'#0': '0', '#1': '1'},
				ExpressionAttributeValues: {':0': {S: '0'}, ':1': {N: String(featured)}},
				KeyConditionExpression: '#0=:0',
				FilterExpression: '#1<>:1',
				Limit: 5
			}, index => {
				console.log('new', index.id);
				if(i++ >= 5) return;
				//ids.push(index.id);
				tasks.push(callback => new Propcott({published: true, id: index.id}).load((err, propcott) => {
					propcott.import(index);
					propcotts.push(propcott);
				}));
			}, err => {
				async.parallel(tasks, (err, results) => {
					return callback(err, propcotts);
				});
			});
		}
	}, (err, results) => {
		console.log(err, results);
	});
	/*
	Propcott.index.query({
		TableName: 'Propcotts',
		IndexName: '4-index',
		ScanIndexForward: false,
		ExpressionAttributeNames: {'#0': '0'},
		ExpressionAttributeValues: {':0': {S: '0'}},
		KeyConditionExpression: '#0=:0',
		Limit: 5
	}, index => {
		if(i++ >= 5) return;
		tasks.push(callback => new Propcott({published: true, id: index.id}).load((err, propcott) => {
			propcott.import(index);
			callback(null, propcott);
		}));
	}, err => {
		if(err) {
			console.error(err);
			return res.send('err');
		}
		async.parallel(tasks, (err, results) => {
			res.render('home', {propcotts: results});
		});
	});*/
};
