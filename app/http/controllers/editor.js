var Propcott = require(app.models.propcott);
var User     = require(app.models.user);

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
		if(err) console.info(err);
		
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

module.exports.save = function(req, res) {
	
	Draft.get(req, function(err, draft) {
		var propcott = new Propcott(draft);
		propcott.save(function(err, propcott) {
			if(propcott.id) return res.redirect('/p/' + propcott.slug());
		});
	});
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



// update creator after login SOMEWHERE



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
					req.session.draftId = draft.draftId;
					
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
