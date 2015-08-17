var passport = require('passport');
var dynamo = local('framework/DynamoDB');
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = local('models/user');

module.exports.authenticate = function(req, res) {
	User.find('local', req.body.email, function(err, user) {
		if(err) {
			req.flash('Invalid username or password');
			return res.render('auth/login');
		}
		req.session.user = user;
		req.flash('Successfully logged in');
		return res.redirect('/');
	});
};

module.exports.login = function(req, res) {
	res.render('auth/login');
};

module.exports.register = function(req, res) {
	if(!(validator.isEmail(req.body.email)
		&& req.body.password.length
		&& req.body.password == req.body.password_confirmation
		&& req.body.name)) {
		req.flash(MessageBag, 'input.incorrect');
		res.render('auth/login');
		return;
	}
	
	var user = new User();
	user.link('local', req.body.email, req.body.password);
	
	delete req.body.password;
	delete req.body.password_confirmation;
	delete req.body['g-recaptcha-response'];
	delete req.body.register;
	
	for(var i in req.body) user[i] = req.body[i];
	user.displayName = req.body.name.split(' ')[0];
	
	user.save(function(err, user) {
		if(err) {
			req.flash(MessageBag, 'auth.registered.error');
			res.render('auth/login');
			return;
		}
		req.flash(MessageBag, 'auth.registered');
		req.session.user = user;
		res.redirect('/');
	});
};

module.exports.logout = function(req, res) {
	req.session.destroy(function(err) {
		if(err) {
			req.flash('Could not log out');
			res.redirect('/');
			return;
		}
		res.clearCookie('sid');
		res.redirect('/');
	});
};
