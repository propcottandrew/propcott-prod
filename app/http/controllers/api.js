var User   = require(app.models.user);
var hasher = require(app.util.hasher);
var s3     = require(app.aws).s3;
var async  = require('async');
var uuid   = require('uuid');
var multer = require('multer');
var ms3    = require('multer-s3');

var upload = multer({
	storage: ms3({
		dirname: 'uploads',
		bucket: 'static.propcott.com',
		secretAccessKey: process.env.AWS_SECRET,
		accessKeyId: process.env.AWS_KEY,
		region: process.env.AWS_REGION,
		filename: function (req, file, callback) {
			// Todo: check if exists
			callback(null, `${uuid.v1()}.${file.originalname.split('.').pop()}`);
		}
	})
}).single('image');

module.exports.upload = function(req, res) {
	upload(req, res, err => {
		if(err) {
			console.error(err);
			res.send({success: false});
		} else {
			res.send({
				success: true,
				path: req.file.key
			});
		}
	});
};
