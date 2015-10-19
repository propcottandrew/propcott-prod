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

module.exports = types;
