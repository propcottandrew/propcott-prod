var less = require('less');
var fs   = require('fs');

if(process.env.NODE_ENV == 'development') {
	var render = (function render() {
		fs.readFile(__base + 'less/style.less', 'utf8', function (err, data) {
			if (err) return err;
			less.render(data, {compress: true, paths: [__base + 'less']}).then(function(output) {
				fs.writeFile(__base + 'public/css/style.css', output.css);
			});
		});
		return render;
	})();

	if(process.env.NODE_ENV == 'development')
		fs.watch(__base + 'less', {recursive: true}, render);
}
