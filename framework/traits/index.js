module.exports = function(options) {
	Function.prototype.trait = function(trait) {
		return local('framework/traits/' + trait).bind(this);
	};

	return function(req, res, next) {
		next();
	};
};
