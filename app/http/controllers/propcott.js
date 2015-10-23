var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var async    = require('async');

module.exports.view = (req, res, next) => {
	async.parallel({
		propcott: callback => new Propcott({published: true, id: req.params.id}).load(callback),
		index: callback => Propcott.find(req.params.id, callback)
	}, (err, data) => {
		if(err) {
			console.error(err);
			return next('route');
		}
		data.propcott.import(data.index);
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
	new User(req.session.user).support(req.params.id, req.body.previous_support == '1', err => {
		if(err) console.error(err);
		req.flash('Thank you for supporting this propcott!');
		res.redirect(`/p/${req.params.slug}`);
	});
};
