var slugToId = require(app.http.middleware.slugToId);

module.exports = (req, res, next) => {
	// Make sure we have req.params.id set
	slugToId(req, res, err => err && next(err));

	// Continue if owner
	if(req.session.user.id == req.params.id) return next();

	req.flash(['error', 'You are not the owner of this propcott.']);
	res.redirect('back');
};
