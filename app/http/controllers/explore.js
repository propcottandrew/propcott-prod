/*
/explore
/explore/daily
/explore/weekly
/explore/monthly
/explore/recent

/explore/targets
/explore/industries

/explore/:industry
/explore/:industry/daily
/explore/:industry/weekly
/explore/:industry/monthly
/explore/:industry/recent

/explore/:industry
/recent/target/:target
*/

var Propcott = require(app.models.propcott);
var async    = require('async');

var indexOn = (req, res, index, locals) => {
	var tasks = [];
	Propcott.index.query({
		TableName: 'Propcotts',
		IndexName: `${index}-index`,
		ScanIndexForward: false,
		ExpressionAttributeNames: {'#0': '0'},
		ExpressionAttributeValues: {':0': {S: '0'}},
		KeyConditionExpression: '#0=:0',
	}, index => {
		tasks.push(callback => new Propcott({published: true, id: index.id}).load((err, propcott) => {
			propcott.import(index);
			callback(null, propcott);
		}));
	}, err => {
		if(err) {
			req.flash('An unexpected error occured.');
			return res.redirect('back');
		}
		async.parallel(tasks, (err, results) => {
			locals = locals || {};
			locals.propcotts = results;
			res.render('explore', locals);
		});
	});
};

module.exports.recent  = (req, res) => indexOn(req, res, 4, {tab: 'new'});
module.exports.daily   = (req, res) => indexOn(req, res, 5, {tab: 'hot', subtab: 'daily'});
module.exports.weekly  = (req, res) => indexOn(req, res, 6, {tab: 'hot', subtab: 'weekly'});
module.exports.monthly = (req, res) => indexOn(req, res, 7, {tab: 'hot', subtab: 'monthly'});
module.exports.all     = (req, res) => indexOn(req, res, 8, {tab: 'hot', subtab: 'all'});
