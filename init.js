global.__base = __dirname + '/';

global.local = function(file) {
	return require(__base + file);
};
