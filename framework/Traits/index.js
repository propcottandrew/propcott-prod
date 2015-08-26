module.exports = function() {
	Function.prototype.trait = function(trait) {
		return local('framework/traits/' + trait).bind(this);
	};
};
