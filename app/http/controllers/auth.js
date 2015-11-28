var passport  = require('passport');
var validator = require('validator');
var bcrypt    = require('bcryptjs');
var dynamo    = require(app.aws).dynamo;
var User      = require(app.models.user);
var Propcott  = require(app.models.propcott);

module.exports.form = (req, res) => res.render('auth/login');

module.exports.login = (req, res) => {
	if(req.body['login-type'] == 'login')
		return login(req, res);
	
	if(req.body['login-type'] == 'signup')
		register(req, res);
};

var login = function(req, res) {
	User.find('local', req.body.user.username, (err, user) => {
		if(err || !user.authenticate(req.body.user.password)) {
			req.flash('Invalid username or password');
			res.redirect('back');
		} else user.load((err, user) => {
			if(err) {
				console.log(err);
				req.flash('Server error');
				return res.redirect('back');
			}
			req.session.user = user.session();
			req.flash('Successfully logged in');
			user.emit('login', err => {
				if(err) console.info(err);
				
				if(req.body.join)
					res.redirect(`/p/${req.body.join}/join`);
				else
					res.redirect(req.session.afterLogin || '/');
			});
		});
	});
};

var register = function(req, res) {
	if(
		!req.body.user.username ||
		!req.body.user.password ||
		!req.body.user.password == req.body.password ||
		req.body.user.email && !validator.isEmail(req.body.user.email)
	) {
		req.flash(MessageBag, 'input.incorrect');
		return res.redirect('back');
	}

	var user = new User();
	user.username = req.body.user.username;
	user.email    = req.body.user.email;
	user.link('local', user.username, req.body.user.password);

	user.save(function(err, user) {
		if(err) {
			if(err.code == 'ConditionalCheckFailedException')
				req.flash('error', 'Username already exists');
			else
				req.flash(MessageBag, 'auth.registered.error');
			return res.redirect('back');
		}
		req.session.user = user.session();
		req.flash(MessageBag, 'auth.registered');
		user.emit('register', err => {
			if(err) console.info(err);
			user.emit('login', err => {
				if(err) console.info(err);
				
				if(req.body.join)
					res.redirect(`/p/${req.body.join}/join`);
				else
					res.redirect(req.session.afterLogin || '/');
			});
		});
	});
};

module.exports.logout = function(req, res) {
	var user = new User(req.session.user);
	new Propcott({draft_id: req.session.draft_id}).delete();

	req.session.destroy(err => {
		if(err) {
			req.flash('Could not log out');
			return res.redirect('/');
		}
		res.clearCookie('sid');
		user.emit('logout', err => {
			if(err) console.info(err);
			if(!req.headersSent) res.redirect('back');
		});
	});
};
