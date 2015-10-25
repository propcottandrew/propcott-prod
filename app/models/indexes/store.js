module.exports = {
	table: 'Store',
	read: 6,
	write: 8,
	schema: {
		key:   'S',
		value: undefined
	},
	keys: schema => ({
		hash: schema.key
	})
};
