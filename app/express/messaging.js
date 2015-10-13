var util = require('util');
global.MessageBag = require(app.locales.en.messaging);

function MessageList() {
	(function(list) {
		list.toString = function() {
			if(list.length > 1)
				return '<ul><li>' + list.join('</li><li>') + '</li></ul>';
			return list[0] || '';
		};
	})(this);
}
util.inherits(MessageList, Array);

module.exports = function() {
	return function(req, res, next) {
		if(req.cookies.flash) {
			res.locals.flash = req.cookies.flash;
			res.clearCookie('flash');
		}

		res.render = (function(render) {
			return function() {
				var i, type;
				if(res.locals.flash) {
					res.locals.messages = new MessageList();
					for(type in (res.locals.flash.txt||{})) {
						if(type == 'none') {
							for(i=0; i<res.locals.flash.txt[type].length; i++)
								res.locals.messages.push(res.locals.flash.txt[type][i]);
							continue;
						}
						if(!res.locals.messages[type]) res.locals.messages[type] = new MessageList();
						for(i=0; i<res.locals.flash.txt[type].length; i++)
							res.locals.messages[type].push(res.locals.flash.txt[type][i]);
					}
					if(res.locals.flash.bag) {
						for(i=0; i<res.locals.flash.bag.length; i++) {
							// what if no type?
							if(util.isArray(MessageBag[res.locals.flash.bag[i]])) {
								var message = MessageBag[res.locals.flash.bag[i]][1];
								type = MessageBag[res.locals.flash.bag[i]][0];
								if(!res.locals.messages[type]) res.locals.messages[type] = new MessageList();
								res.locals.messages[type].push(message);
							} else {
								res.locals.messages.push(MessageBag[res.locals.flash.bag[i]]);
							}
						}
					}
				}
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
			}

			if(!res.locals.flash.txt) res.locals.flash.txt = {};

			if(arguments.length == 1) {
				message = type;
				type = 'none';
			}

			if(!res.locals.flash.txt[type]) res.locals.flash.txt[type] = [];
			res.locals.flash.txt[type].push(message);
		};

		next();
	};
};
