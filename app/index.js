var fs = require('fs');

module.exports = (function read(path) {
	var dir = String(path.endsWith('index.js') ? path.slice(0, -'index.js'.length) : path);
	var files = fs.readdirSync(dir);
	for(var file of files) {
		if(file[0] == '.') continue;
		var stats = fs.statSync(dir + file);
		if(stats.isDirectory())
			if(fs.existsSync(dir + file + '/index.js'))
				path[file] = read(new String(dir + file + '/index.js'));
			else
				path[file] = read(new String(dir + file + '/'));
		if(stats.isFile())
			path[file.replace(/\.[^.]+$/, '')] = dir + file;
	}
	return path;
})(new String(__dirname + '/'));
