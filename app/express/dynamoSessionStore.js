/**
 * DynamoSessionStore
 * Evan Kennedy <evan_kennedy@yahoo.com>
 */

var util  = require('util');
var Store = require(app.models.store);

/**
 * Return the `DynamoSessionStore` extending `express`'s session Store.
 *
 * @param {object} express session
 * @return {Function}
 * @api public
 */

module.exports = function (session) {

	/**
	 * Initialize DynamoSessionStore with the given `options`.
	 *
	 * @param {Object} options
	 * @api public
	 */

	function DynamoSessionStore (options) {
		var self = this;

		options = options || {};
		DynamoSessionStore.super_.call(this, options);
		this.prefix = options.prefix || 'session';
	}

	/**
	 * Inherit from `Store`.
	 */

	util.inherits(DynamoSessionStore, session.Store);

	/**
	 * Attempt to fetch session by the given `sid`.
	 *
	 * @param {String} sid
	 * @param {Function} callback
	 * @api public
	 */
	DynamoSessionStore.prototype.get = function (sid, callback) {
		Store.get(this.prefix + ':' + sid, function(err, data) {
			if(callback) return callback(err, data);
		}, true);
	};

	/**
	 * Commit the given `sess` object associated with the given `sid`.
	 *
	 * @param {String} sid
	 * @param {Session} sess
	 * @param {Function} callback
	 * @api public
	 */
	DynamoSessionStore.prototype.set = function (sid, sess, callback) {
		Store.set(this.prefix + ':' + sid, sess, function(err, data) {
			if(callback) return callback(err, data);
		});
	};

	/**
	 * Destroy the session associated with the given `sid`.
	 *
	 * @param {String} sid
	 * @api public
	 */
	DynamoSessionStore.prototype.destroy = function (sid, callback) {
		Store.remove(this.prefix + ':' + sid, function(err) {
			if(callback) return callback(err);
		});
	};

	/**
	 * Refresh the time-to-live for the session with the given `sid`.
	 *
	 * @param {String} sid
	 * @param {Session} sess
	 * @param {Function} callback
	 * @api public
	 */
	//DynamoSessionStore.prototype.touch = function (sid, sess, callback) {};
	//.length(callback)
	//.clear(callback)
	return DynamoSessionStore;
};
