var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var s3       = require(app.aws).s3;
var async    = require('async');

var editable = [
	'title',
	'title_size',
	'target',
	'goal',
	'why',
	'how',
	'alt',
	'industry',
	'media_link',
	'media_type'
];

module.exports.fresh = function(req, res) {
	var draft_id = req.session.draft_id;
	delete req.session.draft_id;

	res.redirect('/editor');

	if(draft_id) new Propcott({draft_id: req.session.draft}).delete();
};

module.exports.edit = function(req, res) {
	new Propcott({draft_id: req.session.draft_id}).load((err, draft) => {
		console.log(err, draft);
		if(err && err != 'NoIdFound') console.info(err);

		if(req.session.user)
			draft.setCreator(req.session.user);

		res.render('propcott/create', {propcott: draft});
	});
};

module.exports.preview = function(req, res) {
	new Propcott({draft_id: req.session.draft_id}).load((err, draft) => {
		if(err) console.error(err);
		res.render('propcott/preview', {propcott: draft});
	});
};

// move from TMP/ to user hash/
module.exports.save = function(req, res) {
	if(!req.session.draft_id) {
		req.flash('There is nothing to save.');
		return res.redirect('/');
	}

	new Propcott({draft_id: req.session.draft_id}).load((err, draft) => {
		if(err) return console.error(err);
		draft.draft_id = req.session.draft_id;
		if(draft.id) {
			new Propcott({published: true, id: draft.id}).load((err, propcott) => {
				if(err) return console.error(err);
				
				propcott.localIndex(err => {
					// todo
				});

				delete draft.published;
				propcott.import(draft);
				delete propcott.draft_id;
				
				propcott.save(err => {
					if(err) console.error(err);
					else {
						delete req.session.draft_id;
						req.flash('Propcott saved.');
						propcott.reIndex(err => {
							// todo
						});
					}
					res.redirect(`/p/${propcott.slug}`);
					s3.deleteObject({
						Bucket: 'drafts.data.propcott.com',
						Key: `TMP/${draft.draft_id}.json`
					}, err => err && console.error(err));
				});
			});
		} else {
			if(!draft.creator)
				draft.setCreator(req.session.user);

			draft.save(err => {
				if(err) return console.error(err);

				delete req.session.draft_id;
				req.flash('Propcott saved.');
				res.redirect(`/d/${draft.draft_id}`);

				s3.deleteObject({
					Bucket: 'drafts.data.propcott.com',
					Key: `TMP/${draft.draft_id}.json`
				}, err => err && console.error(err));
			});
		}
	});
};

module.exports.handle = function(req, res) {
	switch(req.body.action) {
		case 'preview':
		case 'save':
			if(req.body.how) req.body.how = req.body.how.match(/[^\r\n]+/g);
			if(req.body.alt) req.body.alt = req.body.alt.match(/[^\r\n]+/g);
			async.waterfall([
				callback => {
					console.info(req.session.draft_id);
					if(req.session.draft_id)
						new Propcott({draft_id: req.session.draft_id}).load(callback);
					else
						callback(null, new Propcott());
				},
				(draft, callback) => {
					var params = {};
					for(var k in req.body)
						if(editable.indexOf(k) >= 0) params[k] = req.body[k];

					draft.import(params);
					draft.save(callback);
				}
			], (err, draft) => {
				if(err) console.error(err);
				req.session.draft_id = draft.draft_id;
				res.redirect('/editor/' + req.body.action);
			});
		break;

		case 'cancel':
			if(!req.session.draft_id) {
				req.flash('You aren\'t working on a draft.');
				res.redirect('/');
			} else {
				new Propcott({draft_id: req.session.draft_id}).delete((err, propcott) => {
					if(err) console.error(err);
					req.flash('Your draft has been deleted successfully.');
					if(propcott.id) return res.redirect(`/p/${propcott.slug}`);
					res.redirect('/');
				});
				delete req.session.draft_id;
			}
		break;

		default:
			req.flash('We couldn\'t handle your input.');
			return res.redirect('back');
	}
};
