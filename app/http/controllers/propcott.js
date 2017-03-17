var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var dynamo   = require(app.aws).dynamo;
var async    = require('async');

var months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

module.exports.view = (req, res, next) => {
	async.parallel({
		propcott: callback => new Propcott({published: true, id: req.params.id}).load(callback),
		index: callback => Propcott.find(req.params.id, callback),
		supporting: callback => {
			if(!req.session.user) {
				if(req.session.joined && req.session.joined.indexOf(req.params.id) != -1)
					return callback(null, true);
				
				return callback();
			}
			
			dynamo.query({
				TableName: 'Supporters',
				ExpressionAttributeValues: {
					':0': {N: String(req.params.id)},
					':1': {N: String(req.session.user.id)}
				},
				KeyConditionExpression: `PropcottId=:0 and UserId=:1`
			}, (err, data) => {
				callback(err, data.Count);
			});
		}
	}, (err, data) => {
		if(err) {
			console.error(err);
			return next('route');
		}
		
		if(data.index) {
			delete data.index.updates;
			delete data.index.published;
			delete data.index.created;
			data.propcott.import(data.index);
		}
		
		data.propcott.ads = true;
		
		data.date = function(timestamp) {
			var d = new Date(timestamp);
			return `${months[d.getMonth()].substr(0,3)} ${d.getDate()}, ${d.getFullYear()}`;
		}
		
		if(!req.session.user || req.session.user.id != data.propcott.creator.id)
			res.render('propcott/view', data);
		else
			res.render('propcott/manage', data);
	});
};

module.exports.edit = (req, res) => {
	new Propcott({published: true, id: req.params.id}).load((err, draft) => {
		if(err) {
			console.error(err);
			req.flash(['error', 'An unexpected error occurred.']);
			return res.redirect('back');
		}

		if(!req.session.user || req.session.user.id != draft.creator.id) {
			req.flash(['error', 'You are not the owner of this propcott.']);
			return res.redirect('back');
		}

		delete draft.creator;
		delete draft.published;

		draft.save(err => {
			if(err) console.error(err);
			req.session.draft_id = draft.draft_id;
			res.redirect('/editor');
		});
	});
};

module.exports.join = (req, res) => {
	if(!req.session.user) {
		//console.log(JSON.stringify(req.headers));
		console.log(req.connection.remoteAddress);
		res.send('Thank you for the support, but the anonymous join feature was being abused and must be taken offline until it can be made secure.');
		return;
	}

	new User(req.session.user || {id: -1}).support(req.params.id, req.body.previous_support == '1', err => {
		if(err) console.error(err);
		
		if(!req.session.user) {
			req.session.joined = req.session.joined || [];
			req.session.joined.push(req.params.id);
		}
		
		//req.flash('Thank you for joining this propcott!'); taking this for now to deal with join + signup showing two popups
		res.redirect(`/p/${req.params.slug}`);
	});
};

module.exports.update = (req, res) => {
	new Propcott({published: true, id: req.params.id}).load((err, propcott) => {
		var update = {
			created: Date.now(),
			content: req.body.content,
			title: req.body.title
		};
		
		propcott.updates.push(update);
		
		var snippet = update.content.split(' ');
		snippet.length = 5;
		snippet = snippet.join(' ');
		
		propcott.save(err => {
			if(err) {
				req.flash('An unexpected error occured');
				return res.redirect('back');
			}
			
			req.flash('You have updated your supporters!');
			res.redirect(`/p/${req.params.slug}`);
			
			propcott.supporters((err, data) => {
        data.Items.forEach(v => {
          new User({id: parseInt(v.UserId.N, 10)}).load((err, user) => {
          	if(user.notifications['updates-email']) user.sendEmail('update', 'Update for ' + propcott.title, {
              propcott: propcott,
              snippet: snippet
            });
          });
        });
      });
		});
	});
};
