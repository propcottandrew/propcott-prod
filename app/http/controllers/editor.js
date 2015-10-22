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
		if(err) console.error(err);
		res.render('propcott/preview', {propcott: draft});
	});
};

// move from TMP/ to user hash/
module.exports.save = function(req, res) {
	if(!req.session.draftId) {
		req.flash('There is nothing to save.');
		return res.redirect('/');
	}
	
	new Propcott({draftId: req.session.draftId}).load((err, draft) => {
		if(err) return console.error(err);
		draft.draftId = req.session.draftId;
		if(draft.id) {
			Propcott.find(draft.id, (err, propcott) => {
				if(err) return console.error(err);

				var published = propcott.published;
				propcott.import(draft);
				propcott.published = published;
				delete propcott.draftId;

				propcott.save(err => {
					if(err) console.error(err);
					else req.flash('Propcott saved successfully.');
					
					res.redirect(`/p/${propcott.slug()}`);
					s3.deleteObject({
						Bucket: 'drafts.data.propcott.com',
						Key: `TMP/${draft.draftId}.json`
					}, err => err && console.error(err));
				});
			});
		} else {
			if(!draft.creator)
				draft.setCreator(req.session.user);
			
			draft.save(err => {
				if(err) return console.error(err);
				
				res.redirect(`/d/${draft.draftId}`);
				
				s3.deleteObject({
					Bucket: 'drafts.data.propcott.com',
					Key: `TMP/${draft.draftId}.json`
				}, err => err && console.error(err));
			});
		}
	});
};

module.exports.handle = function(req, res) {
	switch(req.body.action) {
		case 'preview':
		case 'save':
			async.waterfall([
				callback => {
					console.log('starting in it');
					if(req.session.draftId)
						new Propcott({draftId: req.session.draftId}).load(callback);
					else
						callback(null, new Propcott());
				},
				(draft, callback) => {
					console.log(1,draft);
					var params = {};
					for(var k in req.body)
						if(editable.indexOf(k) >= 0) params[k] = req.body[k];
					
					draft.import(params);
					draft.save(callback);
					console.log(draft);
				}
			], (err, draft) => {
				console.log(2, err, draft);
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
