var session       = require('express-session');
var passport      = require('passport');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var cons          = require('consolidate');
var express       = require('express');
var handlebars    = require('handlebars');
var fs            = require('fs');

var router        = require(app.http.router);
var flash         = require(app.express.messaging);
var dynamoSession = require(app.express.dynamoSessionStore)(session);

var template = fs.readFileSync(__dirname + '/views/base.html', 'utf8');
handlebars.registerPartial('base', template);

handlebars.loadPartial = function (name) {
  var partial = handlebars.partials[name];
  if (typeof partial === "string") {
    partial = handlebars.compile(partial);
    handlebars.partials[name] = partial;
  }
  return partial;
};

handlebars.registerHelper("block",
  function (name, options) {
    /* Look for partial by name. */
    var partial
      = handlebars.loadPartial(name) || options.fn;
    return partial(this, { data : options.hash });
  });

handlebars.registerHelper("partial",
  function (name, options) {
    handlebars.registerPartial(name, options.fn);
  });

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

	app.engine('html', cons.handlebars);
	app.set('view engine', 'html');
	app.disable('view cache');
	app.set('views', __dirname + '/views');

/*
	app.set('view engine', 'html');
	app.set('layout', 'layout');
	//app.set('partials', {foo: 'foo'});
	app.enable('view cache');
	app.engine('html', require('hogan-express'));
	app.set('views', __dirname + '/app/views');
*/
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

	var server = app.listen(3000, function() {
		var host = server.address().address;
		var port = server.address().port;
		console.info('Node running at http://%s:%s', host, port);
	});
})(express());
