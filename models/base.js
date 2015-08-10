var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Base() {}

util.inherits(Base, EventEmitter);

module.exports = Base;
