var passport = require('passport');
var dynamo = local('framework/DynamoDB');
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');

module.exports.authenticate = function(req, res) {
	return passport.authenticate('local', function(err, user) {
		if(err) {
			req.flash(err);
			return res.render('auth/login');
		}
		req.session.user = user;
		return res.redirect('/');
	}).apply(this, arguments);
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

	var params = {
		TableName: 'users',
		ConditionExpression: 'attribute_not_exists(Id)',
		Item: {
			Id: {S: 'local:' + req.body.email},
			Created: {N: Date.now().toString()},
			Password: {S: bcrypt.hashSync(req.body.password)},
			Info: {S: JSON.stringify({
				name: req.body.name,
				email: req.body.email,
				org: req.body.org,
				org_link: req.body.org_link
			})}
		}
	};

	dynamo.putItem(params, function(err, data) {
		// should try autolooping in the future
		if(err) {
			console.log(err);
			req.flash(MessageBag, 'auth.registered.error');
			res.render('auth/login');
			return;
		}

		req.flash(MessageBag, 'auth.registered');
		req.session.user = {
			provider: 'local',
			name: req.body.name,
			email: req.body.email
		};
		res.redirect('/');
	});
};

module.exports.logout = function(req, res) {
	req.session.destroy(function(err) {
		if(err) return err;

		res.clearCookie('sid');

		res.redirect('/');
	});
};
