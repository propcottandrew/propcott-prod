var async = require('async');
var aws   = require(app.aws);

/*
implement these in the future: BS, NS, SS, NULL, L, M
also add a Function type and make sure to handle native functions
check how that would be for generators
no type means it cannot be a primary key
*/

var types = require(app.decorators.indexed.types);

var subtract = (a, b) => {
	if(!(a instanceof Array)) return [];
	if(!(b instanceof Array)) return a;
	return a.map((v, i) => ((v != b[i]) ? v : undefined));
};

var compare = (a, b) =>
	a instanceof Array &&
	b instanceof Array &&
	a.length == b.length &&
	a.every((v, i) => v == b[i]);

var to = (item, schema, skipFormat) => {
	var index = [];

	for(var prop in schema)
		if(!schema.hasOwnProperty(prop))
			continue;
		else if(typeof schema[prop] == 'object')
			index = index.concat(to((item || {})[prop], schema[prop], skipFormat));
		else if(skipFormat)
			index.push(item && item[prop]);
		else if(!item || !item[prop])
			index.push(undefined);
		else if(types.has(schema[prop]))
			index.push(types.get(schema[prop]).to(item[prop]));
		else
			index.push({S: JSON.stringify(item[prop])});

	return index;
};

var from = (index, schema, skipFormat) => {
	var item = {}, i = 0;

	for(var prop in schema)
		if(!schema.hasOwnProperty(prop))
			continue;
		else if(typeof schema[prop] == 'object')
			item[prop] = from(index, schema[prop]);
		else if(!index[0])
			{ index.shift(); continue; }
		else if(!skipFormat && types.has(schema[prop]))
			item[prop] = types.get(schema[prop]).from(index.shift());
		else
			item[prop] = index.shift();

	return item;
};

var appendAttributes = (params, diff) => {
	// {"#P":"Percentile"}
	params.ExpressionAttributeNames = diff.reduce((o, v, i) => {
		if(v) o[`#${i.toString(36)}`] = i.toString(36);
		return o;
	}, {});

	// { ":avail":{"S":"Available"}, ":back":{"S":"Backordered"}, ":disc":{"S":"Discontinued"} }
	params.ExpressionAttributeValues = diff.reduce((o, v, i) => {
		if(typeof v == 'object' && v.N) {
			if(v.N[0] == '#') o[`:${i.toString(36)}`] = {N: v.N.substring(2)};
		} else if(v) o[`:${i.toString(36)}`] = v;
		return o;
	}, {});
};

var appendUpdateExpression = (params, diff) => {
	// build update expression
	params.UpdateExpression = 'SET ' + diff.map((v, i) => {
		if(typeof v == 'object' && v.N) {
			if(v.N[0] == '#' && v.N[1] == '+') return `#${i.toString(36)}=#${i.toString(36)}+:${i.toString(36)}`;
			if(v.N[0] == '#' && v.N[1] == '-') return `#${i.toString(36)}=#${i.toString(36)}-:${i.toString(36)}`;
		} else if(v) return `#${i.toString(36)}=:${i.toString(36)}`;
	}).filter(v => v).join(', ');
};

module.exports = (options) => {

	// Set defaults
	options = options || {};
	//if(typeof options.bucket != 'function') options.bucket = ((a) => a)(options.bucket);
	//if(typeof options.key    != 'function') options.key    = ((a) => a)(options.key   );

	// Return decorator
	return target => {

		// Build keys map
		options.keys = options.keys((function recurse(schema, i) {
			var map = {};
			for(var prop in schema) {
				if(!schema.hasOwnProperty(prop)) continue;
				if(typeof schema[prop] == 'object') {
					map[prop] = recurse(schema[prop], i);
				} else {
					map[prop] = i++;
				}
			}
			return map;
		})(options.schema, 0));

		aws.dynamo.describeTable({TableName: options.table}, (err, data) => {
			if(err && err.code == 'ResourceNotFoundException') {
				// attempt to make table
				// place all other commands in a queue while we wait
				return;
			} else if(err) return console.error(err); // do something
			//console.log(JSON.stringify(data.Table.AttributeDefinitions));
		});

		target.index = {

			/*
			Find a single object and return a new instance of it
			target.index.find({status: '0', id: 1337});
			*/
			find: (key, callback) => {
				var item = {TableName: options.table, Key: {}};
				item.Key[options.keys.hash.toString(36)] = {S: String(key.hash)};
				if(typeof options.keys.range != 'undefined')
					item.Key[options.keys.range.toString(36)] = {N: String(key.range)};

				aws.dynamo.getItem(item, (err, data) => {
					if(err) return callback(err);
					if(!data.Item) return callback();

					var index = [];
					for(var prop in data.Item)
						index[parseInt(prop, 36)] = data.Item[prop];

					callback(err, new target(from(index, options.schema)));
				});
			},

			/*
			update one or more properties and return a new instance of it
			old index values are kept in _old
			target.index.update({status: '0', id: 1337}, {
				support: {daily: '+183'},
				industry: 'shoes'
			});
			*/
			update: (key, properties, callback) => {
				var params = {TableName: options.table, Key: {}};
				params.Key[options.keys.hash.toString(36)] = {S: String(key.hash)};
				if(typeof options.keys.range != 'undefined')
					params.Key[options.keys.range.toString(36)] = {N: String(key.range)};

				appendAttributes(params, to(properties, options.schema));
				appendUpdateExpression(params, to(properties, options.schema));

				params.ReturnValues = 'ALL_NEW';

				aws.dynamo.updateItem(params, (err, data) => {
					var index = [];
					for(var prop in data.Attributes)
						index[parseInt(prop, 36)] = data.Attributes[prop];

					callback(err, new target(from(index, options.schema)));
				});
			},

			// write / batch write
			// delete / batch delete

			/*
			Iterate through matching items
			target.index.each({
				key: {status: '0', created: {between: [0, Date.now()]}},
				forward: true,
				limit: 10,
				filter: '',
				skip: 10 // start returning the 11th item (inefficient)
			}, (obj, control) => {
				control.stop();
				// or...
				control.wait();
				setTimeout((() => control.next()), 500);
			});
			*/
			query: (opt, iterator, callback) => {
				// find index name from key attribute
				// always build attributes incrementally rather than a 1:1 mapping



/*
Propcott.index.query({
	TableName: 'Propcotts',
	IndexName: '5-index',
	ScanIndexForward: true,
	ExpressionAttributeNames: {
		'#0': '0',
		'#2': '2'
	},
	ExpressionAttributeValues: {
		':0': {S: '0'},
		':2': {S: 'Grocery'}
	},
	KeyConditionExpression: '#0=:0',
	FilterExpression: '#2=:2'
});
*/





				aws.dynamo.query(opt, (err, data) => {
					if(err) return callback(err);
					// todo: control (wait/next/stop)

					data.Items.forEach(item => {
						var index = [];
						for(var prop in item)
							index[parseInt(prop, 36)] = item[prop];

						iterator(new target(from(index, options.schema)));
					});

					if(data.LastEvaluatedKey) {
						opt.ExclusiveStartKey = data.LastEvaluatedKey;
						target.index.query(opt, iterator, callback);
					}
				});

				/*
				var find = to(opt.key, options.schema, true)
					.map((v, i) => v && i)
					.filter(v => typeof v != 'undefined');

				var params = {TableName: options.table};

				appendAttributes(params, to(opt.key, options.schema, true));

				console.log(JSON.stringify(params, null, 4));
				if(compare(find, [options.keys.hash, options.keys.range])) {
					// primary key
					params.KeyConditionExpression = ''
				} else {
					for(var k in options.keys.local) {
						if(compare(find, [options.keys.hash, options.keys.local[k].range]))
							console.log('local', k);
					}
					// todo: check global
				}*/

				//console.log(options.keys);

			},

			/*
			todo
			*/
			scan: (opt, iterator, callback) => {
				
			}
		};

		target.prototype.on('loaded', (item, callback) => {
			item._index = to(item, options.schema, true) || true;
			callback();
		});

		target.prototype.on('saving', (item, callback) => {
			async.series([
				callback => item.emit('indexing', callback),
				callback => {
					var index = to(item, options.schema, true);
					if(!item._index) {
						// Not indexed, index item
						aws.dynamo.putItem({
							TableName: 'Propcotts',
							Item: to(item, options.schema).reduce((o, v, i) => ((o[i.toString(36)] = v), o), {})
						}, err => {
							if(err) console.error(err);
							else    item._index = index;
						});
					} else {
						var diff = subtract(index, item._index);

						if(diff.length) {
							index = to(item, options.schema);

							// Update index with variables we changed
							var item = {TableName: options.table, Key: {}};
							item.Key[options.keys.hash.toString(36)] = index[options.keys.hash];
							if(typeof options.keys.range != 'undefined')
								item.Key[options.keys.range.toString(36)] = index[options.keys.range];

							appendAttributes(item, index.map((v, i) => diff[i] && v));
							appendUpdateExpression(item, index.map((v, i) => diff[i] && v));

							aws.dynamo.updateItem(item, err => {
								if(err) console.error(err);
								else    item._index = index;
							});
						}
					}
				},
				callback => item.emit('indexed', callback)
			], err => callback(err));
		});
	};
};

module.exports.types = types;

