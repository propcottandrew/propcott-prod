import app.models.base;
import app.dynamo

module.exports =
class store extends app.models.base {
	get(key, callback) {
		callback = callback || noop;

		var params = {
			TableName: 'Store',
			Key: {Key: {S: key}},
			ConsistentRead: false
		};

		app.aws.dynamo.getItem(params, function(err, data) {
			if (err) return callback(err);
			if(!data.Item) return callback();

			if(data.Item.Expires && data.Item.Expires.N < Date.now()) return callback(null, null);

			return callback(null, app.aws.data.from(data.Item.Value));
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
				Value: app.aws.data.to(value)
			}
		};

		if(typeof expires == 'number') params.Item.Expires = {N: expires.toString()};

		app.aws.dynamo.putItem(params, function(err, data) {
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

		app.aws.dynamo.deleteItem(params, function(err, data) {
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

		app.aws.dynamo.updateItem(params, function(err, data) {
			if (err) return callback(err);
			return callback(null, Number(data.Attributes.Value.N));
		});
	};

	decrement(key, amount, callback) {
		return this.increment(key, -amount, callback);
	};
}

