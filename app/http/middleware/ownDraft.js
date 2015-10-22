var Propcott = require(app.models.propcott);
var slugToId = require(app.http.middleware.slugToId);

module.exports = (req, res, next) => {
	// Make sure we have req.params.id set
	slugToId(req, res, err => err && next(err));

	// Continue if owner
	new Propcott({creator: {id: req.session.user.id}, draftId: req.params.draftId}).load((err, propcott) => {
		if(err) return next('route');
		else return next();
	});
};
