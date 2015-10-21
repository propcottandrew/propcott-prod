module.exports = (req, res, next) => {
	// Continue if logged in
	if(req.session.user) return next();
	
	// Keep track of info and redirect
	req.session.previous = {
		url: req.originalUrl,
		body: req.body
	};
	req.flash(['info', 'You must log in first.']);
	res.redirect('/login');
};
