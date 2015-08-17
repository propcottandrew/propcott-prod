module.exports = function GuestMiddleware(req, res, next) {
	if(req.session.user) next('route');
	else next();
};
