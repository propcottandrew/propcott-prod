/*
todo
----
Allow multiple constructors of the same name & anonymous named constructors
*/

function Base() {}

Base.trait('events')();

Base.prototype.toString = function() {
	return JSON.stringify(this);
};

Base.prototype.json = {
	replacer: function(key, value) {
		if(key[0] == '_') return;
		return value;
	},
	space: 0
};

module.exports = Base;
