'use strict';

/*

this shouldn't be a model...
...or should it?
*/

var Base = require(app.models.base);
var aws  = require(app.aws);

class Store extends Base {
	get(key, callback) {
		callback = callback || noop;

		var params = {
			TableName: 'Store',
			Key: {Key: {S: key}},
			ConsistentRead: false
		};

		aws.dynamo.getItem(params, function(err, data) {
			if (err) return callback(err);
			if(!data.Item) return callback();

			if(data.Item.Expires && data.Item.Expires.N < Date.now()) return callback(null, null);

			return callback(null, aws.from(data.Item.Value));
		});
	}

	set(key, value, expires, callback) {
		if(typeof expires === 'function') {
			callback = callback || expires;
			expires = null;
		}
		callback = callback || noop;

		var params = {
			TableName: 'Store',
			Item: {
				Key: {S: key},
				Value: aws.to(value)
			}
		};

		if(typeof expires == 'number') params.Item.Expires = {N: expires.toString()};

		aws.dynamo.putItem(params, function(err, data) {
			if (err) return callback(err);
			return callback(null, data);
		});
	}

	remove(key, callback) {
		callback = callback || noop;
		var params = {
			TableName: 'Store',
			Key: {Key:   {S: key}}
		};

		aws.dynamo.deleteItem(params, function(err, data) {
			if (err) return callback(err);
			return callback();
		});
	}

	increment(key, amount, callback) {
		if(typeof amount === 'function') {
			callback = callback || amount;
			amount = 1;
		}
		callback = callback || noop;

		var params = {
			TableName: 'Store',
			Key: {'Key': {S: key}},
			UpdateExpression: 'ADD #Value :amount',
			ExpressionAttributeNames: {'#Value': 'Value'},
			ExpressionAttributeValues: {':amount': {N: amount.toString() }},
			ReturnValues: 'UPDATED_NEW'
		};

		aws.dynamo.updateItem(params, function(err, data) {
			if (err) return callback(err);
			return callback(null, Number(data.Attributes.Value.N));
		});
	}

	decrement(key, amount, callback) {
		return this.increment(key, -amount, callback);
	}
}

module.exports = new Store();
