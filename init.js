var util = require('util');

global.__base = __dirname + '/';
global.noop = function() {};

global.local = function(file) {
	return require(__base + file);
};

Function.prototype.inherit = function(parent) {
	util.inherits(this, parent);
};

// need to make this recurse better
// when we reach something with a replacer, add value to array and continue

JSON.stringify = (function(original) {
	var replacerMerge = function(replacer1, replacer2) {
		return function(key, value) {
			return replacer1(key, value) && replacer2(key, value);
		};
	};

	return function stringify(value, replacer, space) {
		return original.apply(JSON, [
			value,
			(value.json && value.json.replacer) ? (replacer ? replacerMerge(replacer, value.json.replacer) : value.json.replacer) : replacer,
			value.json && value.json.space || space
		]);
	};
})(JSON.stringify);
