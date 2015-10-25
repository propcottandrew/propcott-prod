var passport  = require('passport');
var validator = require('validator');
var https     = require('https');
var dynamo    = require(app.aws).dynamo;
var User      = require(app.models.user);

module.exports.connect = function(req, res) {
	res.redirect('https://www.facebook.com/dialog/oauth?' +
		`client_id=${process.env.FACEBOOK_CLIENT_ID}` +
    	`&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}`);
	/*return passport.authenticate('facebook', function(err, user) {
		if(err) {
			req.flash(err);
			return res.render('auth/login');
		}
		req.session.user = user;
		return res.redirect('/');
	}).apply(this, arguments);*/
};

module.exports.callback = function(req, res) {
	https.get('https://graph.facebook.com/v2.3/oauth/access_token?' +
		`client_id=${process.env.FACEBOOK_CLIENT_ID}` +
		`&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}` +
		`&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}` +
		`&code=${req.query.code}`,
	response => {
		var data = '';
		response.on('data', chunk => data += chunk);
		response.on('end', function() {
			if(response.statusCode != 200) {
				req.flash('An unexpected error occured');
				res.redirect('/login');
				return;
			}
			data = JSON.parse(data);
			https.get('https://graph.facebook.com/debug_token?' +
				`input_token=${data.access_token}` +
				`&access_token=${process.env.FACEBOOK_CLIENT_ID}|${process.env.FACEBOOK_CLIENT_SECRET}`,
			response => {
				if(response.statusCode != 200) {
					req.flash('An unexpected error occured');
					res.redirect('/login');
					return;
				}
				var data = '';
				response.on('data', chunk => data += chunk);
				response.on('end', () => {
					data = JSON.parse(data);
					if(!data.data.user_id) {
						req.flash('Could not log in');
						res.redirect('/login');
						return;
					}
					console.log('data', data.data);
					
					User.find('facebook', data.data.user_id, (err, user) => {
						if(err) {
							// not found, add
							var user = new User();
							user.link('facebook', data.data.user_id);
							user.save((err, user) => {
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
							return;
						}
						
						req.session.user = user.session();
						req.flash('Successfully logged in');
						user.emit('login', err => {
							if(err) console.info(err);
							res.redirect(req.session.afterLogin || '/');
						});
					});
				});
			}).on('error', e => {
				console.log('Got error: ', e.message);
			});
		});
	}).on('error', e => {
		console.log('Got error: ', e.message);
	});
};
