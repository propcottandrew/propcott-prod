var passport  = require('passport');
var validator = require('validator');
var bcrypt    = require('bcryptjs');
var dynamo    = require(app.aws).dynamo;
var User      = require(app.models.user);
var Propcott  = require(app.models.propcott);

module.exports.form = (req, res) => res.render('auth/login');

module.exports.login = (req, res) => {
	User.find('local', req.body.email, (err, user) => {
		if(err || !user.authenticate(req.body.password)) {
			req.flash('Invalid username or password');
			res.render('auth/login');
		} else user.load((err, user) => {
			if(err) {
				req.flash('Could not load user');
				return res.render('auth/login');
			}
			
			req.session.user = user.session();
			req.flash('Successfully logged in');
			user.emit('login', err => {
				if(err) console.info(err);
				res.redirect(req.session.afterLogin || '/');
			});
		});
	});
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
		req.session.user = user.session();
		req.flash(MessageBag, 'auth.registered');
		user.emit('register', err => {
			if(err) console.info(err);
			user.emit('login', err => {
				if(err) console.info(err);
				res.redirect(req.session.afterLogin || '/');
			});
		});
	});
};

module.exports.logout = function(req, res) {
	var user = new User(req.session.user);
	new Propcott({draftId: req.session.draftId}).delete();
	
	req.session.destroy(err => {
		if(err) {
			req.flash('Could not log out');
			return res.redirect('/');
		}
		res.clearCookie('sid');
		user.emit('logout', err => {
			if(err) console.info(err);
			if(!req.headersSent) res.redirect('/');
		});
	});
};
