var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var dynamo   = require(app.aws).dynamo;
var async    = require('async');

module.exports.view = (req, res, next) => {
	async.parallel({
		propcott: callback => new Propcott({published: true, id: req.params.id}).load(callback),
		index: callback => Propcott.find(req.params.id, callback),
		supporting: callback => {
			if(!req.session.user) return callback();
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
		data.propcott.import(data.index);
		if(!req.session.user || req.session.user.id != data.propcott.creator.id)
			res.render('propcott/view2', data);
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
	new User(req.session.user).support(req.params.id, req.body.previous_support == '1', err => {
		if(err) console.error(err);
		req.flash('Thank you for supporting this propcott!');
		res.redirect(`/p/${req.params.slug}`);
	});
};

module.exports.update = (req, res) => {
	new Propcott({published: true, id: req.params.id}).load((err, propcott) => {
		propcott.updates.push({created: Date.now(), content: req.body.content});
		propcott.save(err => {
			if(err) {
				req.flash('An unexpected error occured');
				return res.redirect('back');
			}
			req.flash('You have updated your supporters!');
			res.redirect(`/p/${req.params.slug}`);
		});
	});
};
