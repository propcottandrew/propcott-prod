global.__base = __dirname + '/';
global.noop = function() {};

global.local = function(file) {
	return require(__base + file);
};
