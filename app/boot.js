var session       = require('express-session');
var passport      = require('passport');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var cons          = require('consolidate');
var express       = require('express');
var fs            = require('fs');
var program = require('commander');

var router        = require(app.http.router);
var flash         = require(app.express.messaging);
var dynamoSession = require(app.express.dynamoSessionStore)(session);

program
	.version('0.0.1')
	.option('-p, --port <n>', 'Port to', parseInt)
	.parse(process.argv);

module.exports = (function(app) {
	app.use(express.static('public'));

	app.use(bodyParser());
	app.use(cookieParser(process.env.APP_SECRET));
	app.use(flash());
	app.use(passport.initialize());
	app.use(session({
		store: new dynamoSession(),
		secret: process.env.APP_SECRET,
		name: 'sid',
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false,
			maxAge: 2700000000
		}
	}));

	// Allow for req.session.previous(body&&url) to be used to restore sessions
	app.use((req, res, next) => {
		if(((req.session||{}).previous||{}).url == req.originalUrl)
			for(var i in req.session.previous.body)
				req.body[i] = req.session.previous.body[i];
		next();
	});

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

	app.engine('html', cons.swig);
	app.set('view engine', 'html');
	app.disable('view cache');
	app.set('views', __dirname + '/views');
	//app.set('layout', 'layout');
	//app.enable('view cache');

	// Test data for homepage
	app.use(function(req, res, next) {
		res.render = (function(render) {
			return function() {
				res.locals.crsf_field = '<input type="hidden" name="_token" value="">';

				render.apply(this, arguments);
			};
		})(res.render);

		next();
	});

	// Initialize the router
	router(app);

	var server = app.listen(program.port || 80, function() {
		var host = server.address().address;
		var port = server.address().port;
		console.info('Node running at http://%s:%s', host, port);
	});
})(express());
