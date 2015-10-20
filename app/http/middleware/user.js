module.exports = (req, res, next) => {
	// Continue if logged in
	if(req.session.user) return next();

	// Let other routes handle this
	next('route');

	// No routes found, let's blow this popsicle stand!
	if(!res.headersSent) {
		req.session.previous = {
			url: req.originalUrl,
			body: req.body
		};
		req.flash(['info', 'You must log in first.']);
		res.redirect('/login');
	}
};
