module.exports.cse = function(req, res) {
	res.render('search', {query: req.query.q});
};
