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
	propcott.title = 'Urging Reddit not to censor content or else there will be a huge loss of users!!';
	propcott.supporters = 86;
	propcott.how = '<ul><li>Stop using Reddit</li><li>Do not purchase Reddit Gold</li><li>Turn on Adblock when using Reddit</li></ul>';
	propcott.alt = '<ul><li>Voat.co</li></ul>';
	propcott.target = 'Reddit';
	propcott.creator = {
		name: 'Drew',
		org: 'Boycott Reddit',
		org_link: 'https://www.facebook.com/pages/Boycott-Reddit/109983302671706'
	};
	propcott.what = 'For Reddit to remove its censorship policies';
	propcott.why = '<p>Reddit used to be the paragon of free speech on the internet where <strong>anyone</strong> can create a subreddit for <strong>anything.&nbsp;</strong>&nbsp;Not anymore. In light of recent events and announcements, Reddit has foregone there core values and has brought Reddit into a new age of censorship&nbsp;</p><p>Action must be taken to prevent Reddit from being further run into the ground.</p>';
	propcott.media = {
		type: 'image',
		link: 'http://static.propcott.com/uploads/55ae9cc633f5f.png'
	};
	propcott.updates = [
		{
			content: 'Don\'t go there again! They\re tricking us to be friendly. Like they\'re being real mean and you shouldn\'t go there. Please listen...',
			created: 1439003993591
		}
	];
	propcott.save(function(err, propcott) {
		if(err) req.flash('Error saving propcott!');
		else req.flash('Propcott saved successfully!');
		res.render('home');
	});
});

var User = local('models/user');
app.get('/test', function(req, res) {
	var user = new User(7);
	user.on('saved', function(user) {
		console.log('saved!');
	});
	user.load(function(err, user) {
		user.link('local', 'evan_kennedy2@yahoo.com', 'soccer3');
		user.save(function(err, user) {
			res.send(String(user));
		});
	});
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
