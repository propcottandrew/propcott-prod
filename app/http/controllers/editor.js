var Propcott = require(app.models.propcott);
var User     = require(app.models.user);

module.exports.fresh = function(req, res) {
	var draftId = req.session.draftId;
	delete req.session.draftId;
	
	res.redirect('/editor');
	
	if(draftId) new Propcott({draftId: req.session.draft}).delete();
};

module.exports.edit = function(req, res) {
	new Propcott({draftId: req.session.draftId}).load((err, draft) => {
		if(err) console.error(err);
		res.render('propcott/create', {propcott: draft});
	});
};

module.exports.preview = function(req, res) {
	new Propcott({draftId: req.session.draftId}).load((err, draft) => {
		if(err) console.error(err);
		res.render('propcott/preview', {propcott: draft});
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

var update = function(req, callback) {
	var propcott = new Propcott({draftId: req.session.draftId});
	propcott.load(err => {
		if(err) console.error(err);
		propcott.import(req.body);
		propcott.save(err => {
			console.log(propcott);
			if(err) console.error(err);
			callback(propcott);
		});
	});
};

module.exports.handle = function(req, res) {
	switch(req.body.action) {
		case 'preview':
			update(req, propcott => {
				req.session.draftId = propcott.draftId;
				res.redirect('/editor/preview');
			});
		break;

		case 'save':
			update(req, propcott => {
				if(req.session.user) {
					propcott.creator = {
						id: req.session.user.id,
						displayName: req.session.user.displayName,
						org: req.session.user.org,
						orgLink: req.session.user.orgLink
					};
					
					propcott.save(err => {
						if(err) console.error(err);
						else req.flash('Propcott saved successfully.');
						res.redirect('/p/' + propcott.slug());
					});
				} else {
					propcott.save(err => {
						if(err) console.error(err);
						req.session.draftId = propcott.draftId;
						req.flash('Please log in to save your propcott.');
						res.redirect('/login');
					})
				}
			});
		break;

		case 'cancel':
			if(!req.session.draftId) {
				req.flash('You aren\'t working on a draft.');
				res.redirect('/');
			} else {
				new Propcott({draftId: req.session.draftId}).delete((err, propcott) => {
					if(err) console.error(err);
					req.flash('Your draft has been deleted successfully.');
					console.info(propcott);
					if(propcott.id) return res.redirect(`/p/${propcott.slug()}`);
					res.redirect('/');
				});
				
			}
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
