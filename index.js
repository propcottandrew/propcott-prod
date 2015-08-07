require('./init');
require('dotenv').load();
local('config');

var express = require('express');
var session = require('express-session');
var flash = local('framework/Messaging');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var swig = require('swig');
var DynamoSessionStore = local('framework/DynamoSessionStore')(session);
var controllers = local('controllers');
var passport = require('passport');

var app = express();

app.use(express.static('public'));
app.use(bodyParser());
app.use(cookieParser(process.env.APP_SECRET));
app.use(flash());
app.use(passport.initialize());
app.use(session({
	store: new DynamoSessionStore,
	secret: process.env.APP_SECRET,
	name: 'sid',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		maxAge: 2700000000
	}
}));
app.use(function(req, res, next) {
	res.render = (function(render) {
		return function() {
			res.locals.user = req.session.user;
			render.apply(this, arguments);
		};
	})(res.render);
	res.locals.session = req.session;
	next();
});

swig.setDefaults({ cache: false });
//swig.setDefaults({
//	cache: {
//		get: function (key) { ... },
//		set: function (key, val) { ... }
//	}
//});

app.use(function(req, res, next) {
	res.render = (function(render) {
		return function() {
			res.locals.tabs = [
				{
					name: 'Hot',
					link: '/explore',
					data: [
						{
							id: 1,
							slug: '1-urging-reddit-not-to-censor-content-or-else-there-will-be-a-huge-loss-of-users',
							media_type: 'image',
							media_link: 'uploads/55ae9cc633f5f.png',
							title: 'Urging Reddit not to censor content or else there will be a huge loss of users!!',
							target: 'Reddit',
							supporters: 4
						}
					],
				},
				{
					name: 'New',
					link: '/explore/new',
					data: [
						{
							id: 2,
							slug: '2-save-your-health-stop-eating-at-mcdonalds',
							media_type: 'image',
							media_link: 'uploads/55b96432378c3.jpg',
							title: 'Save your health. Stop Eating at McDonald\'s!!',
							target: 'McDonald\'s',
							supporters: 2
						}
					]
				},
				{
					name: 'Featured',
					data: [
						{
							id: 3,
							slug: '3-dont-watch-any-ncaa-or-college-sports-until-ncaa-pledges-to-pay-a-decent-wage-to-student-athletes',
							media_type: 'video',
							media_link: 'pX8BXH3SJn0',
							title: 'Don\'t watch ANY NCAA or college sports until NCAA pledges to pay a decent wage to student athletes',
							target: 'NCAA',
							supporters: 3
						}
					]
				}
			];
			res.locals.crsf_field = function() {
				return '<input type="hidden" name="_token" value="">';
			};
			render.apply(this, arguments);
		};
	})(res.render);

	next();
})

app.engine('swig', swig.renderFile);
app.set('view engine', 'swig');


var Propcott = local('models/propcott.js');
app.get('/', function(req, res) {
	var propcott = new Propcott(req);
	propcott.title = 'abcd';
	propcott.save(function(err, data) {

	});

	res.render('home');
});


app.route('/login')
	.get(controllers.auth.login)
	.post(controllers.auth.authenticate);

app.post('/register', controllers.auth.register);
app.get('/logout', controllers.auth.logout);

app.get('/oauth/facebook', controllers.oauth.connect);
app.get('/oauth/facebook/callback', controllers.oauth.callback);

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
