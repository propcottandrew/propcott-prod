module.exports = function GuestMiddleware(req, res, next) {
	// Continue if guest
	if(!req.session.user) return next();

	// Let other routes handle this
	next('route');

	// Allow 404 if no other routes found
};
