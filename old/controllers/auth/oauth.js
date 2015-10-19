var passport = require('passport');
var dynamo = local('framework/dynamo');
var validator = require('validator');

module.exports.connect = function(req, res) {
	return passport.authenticate('facebook', function(err, user) {
		if(err) {
			req.flash(err);
			return res.render('auth/login');
		}
		req.session.user = user;
		return res.redirect('/');
	}).apply(this, arguments);
};

module.exports.callback = function(req, res) {
	passport.authenticate('facebook').apply(this, arguments);
	res.send('done');
};
