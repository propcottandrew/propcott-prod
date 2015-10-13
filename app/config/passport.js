var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bcrypt = require('bcryptjs');
var dynamo = require(app.aws).dynamo;

passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function(email, password, done) {
		var params = {
			TableName: 'users',
			KeyConditionExpression: 'Id = :id',
			ConsistentRead: false,
			ExpressionAttributeValues: {':id': {S: 'local:' + email}}
		};

		dynamo.query(params, function(err, data) {
			if(err) {
				return done(err);
			}
			bcrypt.compare(password, data.Items[0].Password.S, function(err, valid) {
				if(err) {
					return done(err);
				} else {
					if(valid) {
						var info = JSON.parse(data.Items[0].Info.S);
						return done(null, {
							provider: 'local',
							name: info.name,
							email: info.email
						});
					} else {
						return done('Incorrect username or password.');
					}
				}
			});
		});
	}
));

passport.use(new FacebookStrategy({
		clientID: process.env.FACEBOOK_CLIENT_ID,
		clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/oauth/facebook/callback',
		enableProof: false
	},
	function(accessToken, refreshToken, profile, done) {
		var params = {
			TableName: 'users',
			ConditionExpression: 'attribute_exists(Id)',
			Item: {
				Id: {S: 'facebook:' + profile.id},
				Created: {N: Date.now().toString()},
				Info: {S: JSON.stringify(profile)}
			}
		};

		dynamo.putItem(params, function(err, data) {
			console.log(err, data);
			if(err) return done(err);
			return done(null, {
				provider: 'facebook',
				name: profile.name,
				email: profile.email
			});
		});
	}
));
