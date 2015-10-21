var util = require('util');
global.MessageBag = require(app.locales.en.messaging);

var DEFAULT = 'info';

module.exports = function() {
	return function(req, res, next) {
		if(req.cookies.flash) {
			res.locals.flash = req.cookies.flash;
			res.clearCookie('flash');
		}

		res.render = (function(render) {
			return function() {
				if(res.locals.flash)
					res.locals.messages = (res.locals.flash.txt || [])
						.concat((res.locals.flash.bag || []).map(v => 
							(MessageBag[v] instanceof Array) ? MessageBag[v] : [0, MessageBag[v]]))
						.map(v => ({type: v[0] || DEFAULT, content: v[1]}));
				
				render.apply(this, arguments);
			};
		})(res.render);

		res.redirect = (function(redirect) {
			return function() {
				if(res.locals.flash) res.cookie('flash', res.locals.flash);
				redirect.apply(this, arguments);
			};
		})(res.redirect);

		req.flash = function(type, message) {
			if(!res.locals.flash) res.locals.flash = {};

			if(type == MessageBag) {
				if(!res.locals.flash.bag) res.locals.flash.bag = [];
				res.locals.flash.bag.push(message);
				return;
			} else {
				if(!res.locals.flash.txt) res.locals.flash.txt = [];
				if(message) {
					res.locals.flash.txt.push([type, message]);
				} else {
					message = type;
					res.locals.flash.txt.push([0, message]);
				}
			}
		};

		next();
	};
};
