/**
 * DynamoSessionStore
 * Evan Kennedy <evan_kennedy@yahoo.com>
 */

var util = require('util');
var dynamo = local('framework/DynamoDB');

var noop = function(){};

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
		this.column = 'Artifact';

		this.db = dynamo;
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
		console.log('get', sid);
		if (!callback) callback = noop;

		var params = {
			TableName: 'cache',
			Key: {
				Id:      {S: sid},
				Section: {S: this.prefix}
			},
			ConsistentRead: false,
			ExpressionAttributeNames: {'#Value': 'Value'},
			ProjectionExpression: '#Value'
		};

		this.db.getItem(params, function(err, data) {
			if (err) return callback(err);

			try {
				data = JSON.parse(data.Item.Value.S);
			} catch (err) {
				return callback(err);
			}
			return callback(null, data);
		});
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
		console.log('set', sid);
		if (!callback) callback = noop;

		try {
			sess = JSON.stringify(sess);
		} catch (err) {
			return callback(err);
		}

		var params = {
			TableName: 'cache',
			Item: {
				Id: {S: sid},
				Section: {S: this.prefix},
				Expires: {N: '1337'},
				Value: {S: sess},
				Serialized: {BOOL: true}
			}
		};

		this.db.putItem(params, function(err, data) {
			if (err) return callback(err);
			return callback(null, data);
		});
	};

	/**
	 * Destroy the session associated with the given `sid`.
	 *
	 * @param {String} sid
	 * @api public
	 */
	DynamoSessionStore.prototype.destroy = function (sid, callback) {
		var params = {
			TableName: 'cache',
			Key: {
				Id:      {S: sid},
				Section: {S: this.prefix},
			}
		};

		this.db.deleteItem(params, function(err, data) {
			if (err) return callback(err);
			return callback();
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
