require('colors');

var prefixes = {info: 'INFO'.cyan, warn: 'WARN'.yellow, error: 'ERROR'.red};
for(var key in prefixes) (function(fn, prefix) {
	console[key] = function() {
		var d = new Date();
		var args = [].slice.apply(arguments);
		args.splice(1, 0, prefix, (d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()).gray);
		args[0] = '%s %s ' + args[0];
		fn.apply(null, args);
	};
})(console[key], '[' + prefixes[key] + ']');

global.noop = function() {};
require(app.config.index);

Object.prototype.decorate = function(property, decorator) { // decorate([property,] decorator)
	if(!decorator && typeof property == 'function') {
		decorator = property;
		decorator(this);
	} else {
		if(!(property in this)) return console.error('[' + 'WARN'.yellow + ']', 'Could not invoke decorator on', '"' + property + '"');
		var descriptor = Object.getOwnPropertyDescriptor(this, property);
		descriptor = decorator(this, property, descriptor) || descriptor;
		Object.defineProperty(this, property, descriptor);
	}
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
			(value && value.json && value.json.replacer) ? (replacer ? replacerMerge(replacer, value.json.replacer) : value.json.replacer) : replacer,
			value && value.json && value.json.space || space
		]);
	};
})(JSON.stringify);
