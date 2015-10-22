module.exports = (req, res, next) => {
	req.params.id = parseInt(req.params.slug.split('-').pop(), 10);
	if(isNaN(req.params.id)) next('route');
	else next();
};
