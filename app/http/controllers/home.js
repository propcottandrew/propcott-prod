var Propcott = require(app.models.propcott);
var async    = require('async');

module.exports = (req, res) => {
	var tasks = [];
	var i = 0;
	Propcott.index.query({
		TableName: 'Propcotts',
		IndexName: '4-index',
		ScanIndexForward: false,
		ExpressionAttributeNames: {
			'#0': '0',
			//'#2': '2'
		},
		ExpressionAttributeValues: {
			':0': {S: '0'},
			//':2': {S: 'Sports'}
		},
		KeyConditionExpression: '#0=:0',
		//FilterExpression: '#2=:2'
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
	});
};
