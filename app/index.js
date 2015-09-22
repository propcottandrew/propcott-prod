import 'fs';

export class Application {
	constructor() {
		fs.readdir('./app', function(err, files) {
			files.forEach(function(file) {
				console.log(file);
				//this[file] = import './' + file;
			}.bind(this));
		}.bind(this));
	}
}
