var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var s3       = require(app.aws).s3;

module.exports.view = (req, res) => {
	var draft = new Propcott({creator: req.session.user, draft_id: req.params.draft_id});
	draft.load((err, draft) => {
		if(err) console.error(err);
		res.render('propcott/draft', {propcott: draft});
	});
};

module.exports.edit = function(req, res) {
	new Propcott({creator: req.session.user, draft_id: req.params.draft_id}).load((err, draft) => {
		if(err) console.error(err);

		delete draft.creator;

		draft.save(err => {
			if(err) console.error(err);
			req.session.draft_id = draft.draft_id;
			res.redirect('/editor');
		});
	});
};

module.exports.remove = (req, res) => {
	new Propcott({creator: req.session.user, draft_id: req.params.draft_id}).delete((err, draft) => {
		if(err) return console.error(err);
		req.flash('Propcott deleted successfully.');
		res.redirect('/');
	});
};

module.exports.publish = (req, res) => {
	new Propcott({creator: req.session.user, draft_id: req.params.draft_id}).load((err, draft) => {
		if(err) return console.error(err);

		var draft_id = draft.draft_id;
		delete draft.draft_id;
		draft.published = true;
		
		if(!draft.target) delete draft.target;
		if(!draft.industry) delete draft.industry;

		draft.support = {
			daily   : 0,
			weekly  : 0,
			monthly : 0,
			all     : 0,
			previous: 0
		};

		draft.save((err, propcott) => {
			if(err) console.error(err);
			else propcott.reIndex(err => {
				if(err) console.error(err);
				res.redirect(`/p/${propcott.slug}`);
			});
			
			new User(req.session.user).load((err, user) => {
				user.propcotts.push(propcott.id);
				user.save(err => {
					if(err) console.error(err);
					else new Propcott({creator: req.session.user, draft_id: draft_id}).delete(err => err && console.error(err));
				});
				
				if(user.notifications['publish-email'])
					user.sendEmail('publish', propcott.title, {propcott: propcott});
			});
		});
	});
};
