var async = require('async');
var aws   = require(app.aws);

/*
implement these in the future: BS, NS, SS, NULL, L, M
also add a Function type and make sure to handle native functions
check how that would be for generators
no type means it cannot be a primary key
*/

var types = new WeakMap();

types.set(Object, {
	to:   val => ({S: JSON.stringify(val)}),
	from: val => JSON.parse(val),
	type: 'S'
});

types.set(Array, {
	to:   val => ({S: JSON.stringify(val)}),
	from: val => JSON.parse(val),
	type: 'S'
});

types.set(String, {
	to:   val => ({'S': String(val)}),
	from: val => val.S,
	type: 'S'
});

types.set(Number, {
	to:   val => ({N: String(val)}),
	from: val => Number(val.N),
	type: 'N'
});

types.set(Boolean, {
	to:   val => ({BOOL: Boolean(val)}),
	from: val => Boolean(val.BOOL)
});

types.set(Date, {
	to:   val => ({N: String(val.getTime())}),
	from: val => new Date(Number(val.N)),
	type: 'N'
});

types.set(Buffer, {
	to:   val => ({B: val.toString('base64')}),
	from: val => new Buffer(String(val.B), 'base64'),
	type: 'B'
});

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

var to = (item, schema, awsFormat) => {
	var index = [];

	for(var prop in schema)
		if(!schema.hasOwnProperty(prop))
			continue;
		else if(typeof schema[prop] == 'object')
			index = index.concat(to((item || {})[prop], schema[prop], awsFormat));
		else if(awsFormat)
			index.push(item[prop]);
		else if(!item || !item[prop])
			index.push(undefined);
		else if(types.has(schema[prop]))
			index.push(types.get(schema[prop]).to(item[prop]));
		else
			index.push({S: JSON.stringify(item[prop])});

	return index;
};

var from = (index, schema) => {
	var item = {}, i = 0;

	for(var prop in schema)
		if(!schema.hasOwnProperty(prop))
			continue;
		else if(typeof schema[prop] == 'object')
			item[prop] = from(index, schema[prop]);
		else if(!index[0])
			{ index.shift(); continue; }
		else if(types.has(schema[prop]))
			item[prop] = types.get(schema[prop]).from(index.shift());
		else
			item[prop] = index.shift();

	return item;
};

var appendUpdateExpression = (params, diff) => {
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
				
				appendUpdateExpression(params, to(properties, options.schema));
				
				params.ReturnValues = 'ALL_NEW';
				
				aws.dynamo.updateItem(params, (err, data) => {
					var index = [];
					for(var prop in data.Attributes)
						index[parseInt(prop, 36)] = data.Attributes[prop];
					
					callback(err, new target(from(index, options.schema)));
				});
				//return new target();
			},
			
			// write / batch write
			// delete / batch delete
			
			/*
			Iterate through matching items
			target.index.each({
				{status: '0', created: {between: [0, Date.now()]}},
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
			query: (options, iterator, callback) => {
				
			},
			
			/*
			
			*/
			scan: (options, iterator, callback) => {
				
			}
		};
		
		target.prototype.on('loaded', (item, callback) => {
			item._index = to(item, options.schema, true) || true;
			callback();
		});

		target.prototype.on('saved', (item, callback) => {
			callback();
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
					
					appendUpdateExpression(item, index.map((v, i) => diff[i] && v));
					
					aws.dynamo.updateItem(item, err => {
						if(err) console.error(err);
						else    item._index = index;
					});
				}
			}
		});
	};
};

module.exports.types = types;

