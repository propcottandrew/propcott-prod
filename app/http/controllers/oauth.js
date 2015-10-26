var passport  = require('passport');
var validator = require('validator');
var https     = require('https');
var dynamo    = require(app.aws).dynamo;
var User      = require(app.models.user);

module.exports.connect = function(req, res) {
	res.redirect('https://www.facebook.com/dialog/oauth?' +
		`client_id=${process.env.FACEBOOK_CLIENT_ID}` +
    	`&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}` +
    	'&scope=public_profile,email');
};

var read = (url, callback) => {
	https.get(url, response => {
		var data = '';
		response.on('data', chunk => data += chunk);
		response.on('end', function() {
			if(response.statusCode != 200)
				callback(response.statusCode, data);
			else
				callback(null, JSON.parse(data));
		});
	}).on('error', e => {
		callback(e);
	});
}

module.exports.callback = function(req, res) {
	read('https://graph.facebook.com/v2.3/oauth/access_token?' +
		`client_id=${process.env.FACEBOOK_CLIENT_ID}` +
		`&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}` +
		`&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}` +
		`&code=${req.query.code}`,
	(err, data) => {
		if(err) {
			req.flash('An unexpected error occured');
			return res.redirect('/login');
		}
		read('https://graph.facebook.com/debug_token?' +
			`input_token=${data.access_token}` +
			`&access_token=${process.env.FACEBOOK_CLIENT_ID}|${process.env.FACEBOOK_CLIENT_SECRET}`,
		(err, data) => {
			if(err) {
				req.flash('An unexpected error occured');
				return res.redirect('/login');
			}
			
			User.find('facebook', data.data.user_id, (err, user) => {
				if(err) {
					// Register
					read(`https://graph.facebook.com/v2.5/${data.data.user_id}` +
						'?fields=id,name,picture,email' +
						`&access_token=${process.env.FACEBOOK_CLIENT_ID}|${process.env.FACEBOOK_CLIENT_SECRET}`,
					(err, data) => {
						if(err) {
							req.flash('An unexpected error occured');
							return res.redirect('/login');
						}
						var user = new User();
						user.link('facebook', data.id);
						user.email = data.email;
						user.name = data.name;
						user.display_name = data.name.split(' ')[0];
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
					});
					return;
				}
				
				// Log in
				user.load(err => {
					if(err) {
						req.flash('Could not log in');
						return res.redirect('back');
					}
					req.session.user = user.session();
					req.flash('Successfully logged in');
					user.emit('login', err => {
						if(err) console.info(err);
						res.redirect(req.session.afterLogin || '/');
					});
				});
			});
		});
	});
					/*
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
					*/
};
