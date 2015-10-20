module.exports = (req, res, next) => {
	req.params.id = parseInt(req.params.slug, 10);
	next();
};
