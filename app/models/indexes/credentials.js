module.exports = {
	table: 'Credentials',
	read: 5,
	write: 2,
	schema: {
		key:      'S',
		provider: 'S',
		verified: 'N'
	},
	keys: schema => ({
		hash: schema.key,
		range: schema.provider,
		local: {
			verified: {
				range: schema.verified,
				projection: 'ALL'
			}
		}
	})
};
