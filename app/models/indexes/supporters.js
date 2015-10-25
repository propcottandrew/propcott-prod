module.exports = {
	table: 'Supporters',
	read: 5,
	write: 5,
	schema: {
		propcott: 'N',
		user:     'N',
		created:  'N'
	},
	keys: schema => ({
		hash:  schema.propcott,
		range: schema.user,
		local: {
			created: {
				range: schema.created,
				projection: 'ALL'
			}
		}
	})
};
