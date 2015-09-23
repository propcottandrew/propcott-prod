var fs = require('fs');

var app = new (class Application {})();
(function read(path, app) {
	var files = fs.readdirSync(path);
	for(var file of files) {
		if(file[0] == '.' || file == 'node_modules' && path == './') continue;
		var stats = fs.statSync(path + file);
		if(stats.isDirectory())
			read(path + file + '/', app[file] = {});
		if(stats.isFile())
			app[file.replace(/\.[^.]+$/, '')] = path + file;
	}
})(__dirname + '/', app);

module.exports = app;
