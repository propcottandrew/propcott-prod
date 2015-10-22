var Propcott = require(app.models.propcott);

module.exports = (req, res, next) => {
	// Continue if owner
	new Propcott({creator: {id: req.session.user.id}, draft_id: req.params.draft_id}).load((err, propcott) => {
		if(err) return next('route');
		else return next();
	});
};
