var Propcott = require(app.models.propcott);
var User     = require(app.models.user);

module.exports.fresh = function(req, res) {
	if(req.session.draft) {
		var propcott = new Propcott({draftId: req.session.draft});
		delete req.session.draft;
		propcott.delete();
	}
	res.redirect('/editor');
};

module.exports.edit = function(req, res) {
	Propcott.get(req.session.draftId, function(err, draft) {
		res.render('propcott/create', {propcott: draft});
	});
};

module.exports.preview = function(req, res) {
	Draft.get(req, function(err, draft) {

	});
};

module.exports.save = function(req, res) {
	if(!req.session.user) {
		req.flash('Please log in to save your draft.');
		return res.redirect('/login');
	}

	Draft.get(req, function(err, draft) {
		var propcott = new Propcott(draft);
		propcott.save(function(err, propcott) {
			if(propcott.id) return res.redirect('/p/' + propcott.slug());

		});
	});
};

module.exports.load = function(req, res) {
	Propcott.find(id, function(err, propcott) {
		Draft.set(propcott, function(err, draft) {
			res.redirect('/editor');
		});
	});
};

module.exports.handle = function(req, res) {
	switch(req.body.action) {
		case 'preview':
			var propcott = this.updateDraft(req);
			return res.redirect('/editor/preview');
		break;

		case 'save':
			var propcott = this.updateDraft(req);

			if(req.session.user) {
				req.flash('Please log in to save your propcott.');
				return res.redirect('/login');
			}

			propcott.creator = {
				id: req.session.user.id,
				displayName: req.session.user.displayName,
				org: req.session.user.org,
				orgLink: req.session.user.orgLink
			};

			propcott.save();

			req.flash('Propcott saved successfully.');
			return res.redirect('/p/' + propcott.slug());
		break;

		case 'cancel':
			if(!this.hasDraft(req)) {
				req.flash('You aren\'t working on a draft.');
				return res.redirect('back');
			}

			var propcott = this.getDraft(req);

			this.clearDraft(req);
			req.flash('Your draft has been deleted successfully.');

			if(propcott.id) return redirect('/p/' + propcott.slug());

			return res.redirect('/');
		break;

		default:
			req.flash('We couldn\'t handle your input.');
			return res.redirect('back');
	}
};

var Draft = {
	clear: function(req) {

	},
	update: function(req) {

	},
	get: function(req) {

	},
	set: function(draft) {

	}
};

/*
drafts.data.propcott.com
{req.sessionId}.json
*/
