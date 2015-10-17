module.exports = function UserMiddleware(req, res, next) {
	if(!req.session.user) next('route');
	else next();
};
