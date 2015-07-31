global.__base = __dirname + '/';

require('dotenv').load();
var express = require('express');
var session = require('express-session');
var DynamoSessionStore = require(__base + 'framework/DynamoSessionStore')(session);
var aws = require('aws-sdk');
var flash = require(__base + 'framework/Messaging');
var cookieParser = require('cookie-parser');
var swig = require('swig');

var app = express();

aws.config.accessKeyId = process.env.AWS_KEY;
aws.config.secretAccessKey = process.env.AWS_SECRET;
aws.config.region = process.env.AWS_REGION;
aws.config.apiVersions = {
	dynamodb: '2012-08-10'
};

app.use(express.static('public'));
app.use(cookieParser(process.env.APP_SECRET));
app.use(flash());
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
			res.locals.user = {
				name: 'Evan',
				id: '1'
			};
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

app.get('/', function(req, res) {
	res.redirect('/1');
});

app.get('/1', function(req, res) {
	res.render('home');
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
