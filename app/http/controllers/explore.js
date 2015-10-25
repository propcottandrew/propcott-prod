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

module.exports.recent = (req, res) => {
	var tasks = [];
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
	}, index => {
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
			res.render('explore', {propcotts: results});
		});
	});
};
/*
Propcott.index.query({
	TableName: 'Propcotts',
	IndexName: '5-index',
	ScanIndexForward: true,
	ExpressionAttributeNames: {
		'#0': '0',
		'#2': '2'
	},
	ExpressionAttributeValues: {
		':0': {S: '0'},
		':2': {S: 'Grocery'}
	},
	KeyConditionExpression: '#0=:0',
	FilterExpression: '#2=:2'
}, obj => {
	console.log(obj);

	public function recent()
	{
		return view('explore', [
			'tab' => 'new',
			'propcotts' => Propcott::where('published', true)->orderBy('created_at', 'desc')->paginate(10)
		]);
	}
*/