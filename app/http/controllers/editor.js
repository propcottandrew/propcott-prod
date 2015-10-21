var Propcott = require(app.models.propcott);
var User     = require(app.models.user);
var s3       = require(app.aws).s3;

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

module.exports.save = function(req, res, next) {
	console.log(req.session);
	if(!req.session.draftId) {
		next('route');
		if(!res.headersSent) {
			req.flash('There is nothing to save.');
			return res.redirect('/');
		}
	}
	
	var id = req.session.draftId.replace(/^expire\//, '');
	
	new Propcott({draftId: req.session.draftId}).load((err, draft) => {
		if(err) console.info(err);
		
		console.log(draft);
		new User({id: req.session.user.id}).load((err, user) => {
			if(err) console.info(err);
			console.log(user);
			
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

module.exports.load = function(req, res) {
	Propcott.find(id, (err, propcott) => {
		if(err) return console.error(err);
		
		var draft = new Propcott(propcott);
		draft.published = false;
		
		draft.setCreator(req.session.user);
		
		draft.save(propcott, err => {
			if(err) console.error(err);
			res.redirect('/editor');
		});
	});
};

var update = function(req, callback) {
	var params = {};
	for(var k in req.body)
		if(editable.indexOf(k) >= 0) params[k] = req.body[k];
			
	var then = (err, draft) => {
		if(err) console.error(err);
		
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
			update(req, (err, draft) => {
				console.log(err, draft);
				req.session.draftId = draft.draftId;
				res.redirect('/editor/preview');
			});
		break;

		case 'save':
			update(req, (err, draft) => {
				if(err) console.error(err);
				
				if(draft.draftId) req.session.draftId = draft.draftId;
				
				if(req.session.user && typeof draft.id != 'undefined' && req.session.user.id == draft.creator.id) {
					new Propcott({id: draft.id}).load((err, propcott) => {
						if(err) console.error(err);
						
						delete draft.published;
						propcott.import(draft);
						
						propcott.save(err => {
							if(err) console.error(err);
							else {
								draft.delete();
								delete req.session.draftId;
							}
							req.flash('Propcott saved successfully.');
							res.redirect(`/p/${propcott.id}`);
						});
					});
				} else {
					if(req.session.user) {
						req.flash('Propcott saved successfully.');
						res.redirect(`/d/${draft.draftId}`);
					} else res.redirect('/editor/save');
				}
			});
		break;

		case 'cancel':
			if(!req.session.draftId) {
				req.flash('You aren\'t working on a draft.');
				res.redirect('/');
			} else {
				delete req.session.draftId;
				new Propcott({draftId: req.session.draftId}).delete((err, propcott) => {
					if(err) console.error(err);
					req.flash('Your draft has been deleted successfully.');
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
