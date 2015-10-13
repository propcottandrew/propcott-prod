/*

use a WeakSet to hold this information so we don't hold references to objects incase they are destroyed (and thus won't be used)

implement these in the future: BS, NS, SS, NULL, L, M
also add a Function type and make sure to handle native functions
check how that would be for generators


var Query  = require('./dynamoQuery.js');
var Mapper = require('./dynamoMapper.js');

Query.use(Mapper);

Mapper.addType(Object, {
	to:   val => ({S: JSON.stringify(val)}),
	from: val => JSON.parse(val)
});

Mapper.addType(Array, {
	to:   val => ({S: JSON.stringify(val)}),
	from: val => JSON.parse(val)
});

Mapper.addType(String, {
	to:   val => ({'S': String(val)}),
	from: val => val.S
});

Mapper.addType(Number, {
	to:   val => ({N: String(val)}),
	from: val => Number(val.N)
});

Mapper.addType(Boolean, {
	to:   val => ({BOOL: Boolean(val)}),
	from: val => Boolean(val.BOOL)
});

Mapper.addType(Date, {
	to:   val => ({N: String(val.getTime())}),
	from: val => new Date(Number(val.N))
});

Mapper.addType(Buffer, {
	to:   val => ({B: val.toString('base64')}),
	from: val => new Buffer(String(val.B), 'base64')
});
*/

module.exports = {
	table: 'Propcotts',
	read: 3,
	write: 6,
	schema: {
		status: String,
		id:     Number,
		support: {
			daily:   Number,
			weekly:  Number,
			monthly: Number,
			all:     Number
		}
	},
	keys: schema => ({
		hash: schema.status,
		range: schema.id,
		local: {
			daily: {
				range: schema.support.daily,
				projection: [schema.id]
			},
			weekly: {
				range: schema.support.weekly,
				projection: [schema.id]
			},
			monthly: {
				range: schema.support.monthly,
				projection: [schema.id]
			},
			all: {
				range: schema.support.all,
				projection: [schema.id]
			}
		},
		global: {
			id: {
				read: 6,
				write: 5,
				hash: schema.Id,
				projection: 'ALL'
			}
		}
	})
};
