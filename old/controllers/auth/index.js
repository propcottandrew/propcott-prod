var passport = require('passport');
var dynamo = local('framework/dynamo');
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = local('models/user');

module.exports.authenticate = function(req, res) {
	User.find('local', req.body.email, function(err, user) {
		if(err) {
			req.flash('Invalid username or password');
			return res.render('auth/login');
		}
		user.load(function(err, user) {
			if(err) {
				req.flash('Could not load user');
				return res.render('auth/login');
			}
			req.session.user = user;
			req.flash('Successfully logged in');
			user.emit('login');
			res.redirect('/');
		});
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
		return res.redirect('/login');
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
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash(MessageBag, 'auth.registered');
		user.emit('register');
		user.emit('login');
		res.redirect('/');
	});
};

module.exports.logout = function(req, res) {
	var user = new User(req.session.user);
	req.session.destroy(function(err) {
		if(err) {
			req.flash('Could not log out');
			res.redirect('/');
			return;
		}
		res.clearCookie('sid');
		user.emit('logout');
		res.redirect('/');
	});
};
