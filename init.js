var util = require('util');

global.__base = __dirname + '/';
global.noop = function() {};

global.local = function(file) {
	return require(__base + file);
};

Function.prototype.inherit = function(parent) {
	util.inherits(this, parent);
};
