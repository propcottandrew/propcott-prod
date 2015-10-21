var slugToId = require(app.http.middleware.slugToId);

module.exports = (req, res, next) => {
	// Make sure we have req.params.id set
	slugToId(req, res, err => err && next(err));

	// Continue if owner
	new Propcott({draftId: req.params.draftId}).load((err, propcott) => {
		if(err) {
			console.error(err);
			return next('route');
		}
		if(propcott.draftId == req.params.draftId) return next();
		else return next('route');
	});
};
