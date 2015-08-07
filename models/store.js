var dynamo = local('framework/DynamoDB');

function Store() {}

var toAws = function(attribute) {
	if(attribute === null || attribute === undefined) return {NULL: true};
	if(typeof attribute == 'number') return {N: attribute.toString()};
	if(typeof attribute == 'boolean') return {BOOL: attribute};
	return {S: JSON.stringify(attribute)};
};

var fromAws = function(item) {
	if(item.NULL !== undefined) return null;
	if(item.BOOL !== undefined) return item.BOOL;
	if(item.N !== undefined) return Number(item.N);
	return JSON.parse(item.S);
};

Store.get = function(key, callback) {
	callback = callback || noop;

	var params = {
		TableName: 'Store',
		Key: {Key: {S: key}},
		ConsistentRead: false
	};

	dynamo.getItem(params, function(err, data) {
		if (err) return callback(err);

		if(data.Item.Expires && data.Item.Expires.N < Date.now()) return callback(null, null);

		return callback(null, fromAws(data.Item.Value));
	});
};

Store.set = function(key, value, expires, callback) {
	if(typeof expires === 'function') {
		callback = callback || expires;
		expires = null;
	}
	callback = callback || noop;

	var params = {
		TableName: 'Store',
		Item: {
			Key: {S: key},
			Value: toAws(value)
		}
	};

	if(typeof expires == 'number') params.Item.Expires = {N: expires.toString()};

	dynamo.putItem(params, function(err, data) {
		if (err) return callback(err);
		return callback(null, data);
	});
};

Store.increment = function(key, amount, callback) {
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

	dynamo.updateItem(params, function(err, data) {
		if (err) return callback(err);
		return callback(null, Number(data.Attributes.Value.N));
	});
};

Store.decrement = function(key, amount, callback) {
	return Store.increment(key, -amount, callback);
};

module.exports = Store;
