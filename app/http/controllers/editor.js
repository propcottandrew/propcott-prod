var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var s3       = require(app.aws).s3;
var async    = require('async');

var editable = [
	'title',
	'who',
	'what',
	'why',
	'how',
	'alt',
	'industry',
	'media',
	'media_type'
];

module.exports.fresh = function(req, res) {
	var draftId = req.session.draftId;
	delete req.session.draftId;

	res.redirect('/editor');

	if(draftId) new Propcott({draftId: req.session.draft}).delete();
};

module.exports.edit = function(req, res) {
	new Propcott({draftId: req.session.draftId}).load((err, draft) => {
		if(err && err != 'NoIdFound') console.info(err);

		if(req.session.user)
			draft.setCreator(req.session.user);

		res.render('propcott/create', {propcott: draft});
	});
};

module.exports.preview = function(req, res) {
	new Propcott({draftId: req.session.draftId}).load((err, draft) => {
		console.log(draft);
		if(err) console.error(err);
		res.render('propcott/preview', {propcott: draft});
	});
};

// move from /expire to draft
module.exports.save = function(req, res, next) {
	if(!req.session.draftId) {
		next('route');
		if(!res.headersSent) {
			req.flash('There is nothing to save.');
			return res.redirect('/');
		}
	}

	new Propcott({draftId: 'expire/' + req.session.draftId}).load((err, draft) => {
		if(err) console.info(err);

		if(draft.id) {
			Propcott.find(draft.id, (err, propcott) => {
				if(err) return console.error(err);

				propcott.import(draft);
				delete propcott.draftId;

				propcott.save(err => {
					if(err) console.error(err);
					else req.flash('Propcott saved successfully.');
					res.redirect(`/p/${propcott.slug()}`);
					draft.delete(err => err && console.error(err));
				});
			});
		} else {
			// save back to the draft (not expiring)


			if(!draft.creator) {
				// load user and add creator
				// save to user's drafts
			}

			// delete expiring draft
		}




		new User({id: req.session.user.id}).load((err, user) => {
			if(err) console.info(err);

			draft.draftId = id;
			draft.setCreator(user);
			if(!user.drafts) user.drafts = [];
			user.drafts.push(draft.draftId);

			draft.save(err => {
				if(err) console.info(err);
				res.redirect(`/d/${id}`);

				user.save(err => err && console.error(err));
				s3.deleteObject({
					Bucket: 'drafts.data.propcott.com',
					Key: `expire/${id}.json`
				}, err => err && console.error(err));
			});
		});
	});

	/*s3.getObject({
		Bucket: 'drafts.data.propcott.com',
		Key: `expire/${id}.json`
	}, (err, data) => {
		if(err) return console.error(err);
		var draft = new Propcott(data.Item);

		delete req.session.draftId;
		new Propcott({draftId: id}).load((err, propcott) => {
			if(err) console.error(err);
			propcott.setCreator(req.session.user);
			propcott.save(err => err && console.error(err));
		});

		new User({id: req.session.user.id}).load((err, user) => {

			if(!user.drafts) user.drafts = [];
			user.drafts.push(req.session.draftId);
			res.redirect(`/d/${id}`);
		});
		s3.deleteObject({
			Bucket: 'drafts.data.propcott.com',
			Key: `expire/${id}.json`
		}, err => err && console.error(err));
	});*/
};

var update = function(req, callback) {
	var params = {};
	for(var k in req.body)
		if(editable.indexOf(k) >= 0) params[k] = req.body[k];

	var then = (err, draft) => {
		if(err) console.error(err);

		if(req.session.user)
			draft.setCreator(req.session.user);

		draft.import(params);
		draft.save(err => callback(err, draft));
	};

	if(req.session.draftId) {
		new Propcott({draftId: req.session.draftId}).load(then);
	} else {
		then(null, new Propcott());
	}
};

module.exports.handle = function(req, res) {
	switch(req.body.action) {
		case 'preview':
		case 'save':
			async.series([
				callback => {
					if(req.session.draftId)
						new Propcott({draftId: req.session.draftId}).load(callback);
					else
						callback(null, new Propcott());
				},
				callback => {

				}
			], err => {
				if(err) console.error(err);
			});
			update(req, (err, draft) => {
				if(err) console.error(err);
				req.session.draftId = draft.draftId;
				res.redirect('/editor/' + req.body.action);
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
					if(propcott.id) return res.redirect(`/p/${propcott.slug()}`);
					res.redirect('/');
				});
				delete req.session.draftId;
			}
		break;

		default:
			req.flash('We couldn\'t handle your input.');
			return res.redirect('back');
	}
};
