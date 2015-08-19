// convert to base 36 and reverse string for better partitioning.
module.exports.to = function(id) {
	var base36 = id.toString(36);
	for(var i = base36.length - 1, hash = ''; i >= 0; hash += base36[i--]);
	return hash;
};

module.exports.from = function(hash) {
	for(var i = hash.length - 1, id = ''; i >= 0; id += hash[i--]);
	return parseInt(id, 36);
};
