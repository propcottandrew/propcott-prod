var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dynamo = local('framework/DynamoDB');
var bcrypt = require('bcrypt-nodejs');

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
