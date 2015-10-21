var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var s3       = require(app.aws).s3;

module.exports.view = (req, res) => {
	new Propcott({draftId: req.params.draftId}).load((err, propcott) => {
		res.render('propcott/draft', {propcott: propcott});
	});
};

module.exports.edit = function(req, res) {
	new Propcott({draftId: req.params.draftId}).load((err, draft) => {
		if(err) console.error(err);

		draft.draftId = 'expire/' + draft.draftId;

		draft.save(err => {
			if(err) console.error(err);
			req.session.draftId = draft.draftId;
			res.redirect('/editor');
		});
	});
};

module.exports.remove = (req, res) => {
	new Propcott({draftId: req.params.draftId}).delete((err, draft) => {
		if(err) return console.error(err);

		new User(req.session.user).load((err, user) => {
			if(err) return console.error(err);
			user.drafts = user.drafts.filter(v => v != draft.draftId);
			user.save(err => {
				if(err) console.error(err);
				else req.flash('Propcott deleted successfully.');
				res.redirect('/');
			});
		});
	});
};

module.exports.publish = (req, res) => {

};
