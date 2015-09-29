module.exports = {
	table: 'Propcotts'
	read: 3,
	write: 6,
	schema: {
		status: 'S',
		id:     'N',
		support: {
			daily:   'N',
			weekly:  'N',
			monthly: 'N',
			all:     'N'
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
