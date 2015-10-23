module.exports = {
	table: 'Propcotts',
	read: 9,
	write: 10,
	schema: {
		status  : String, // 0
		id      : Number, // 1
		industry: String, // 2
		target  : String, // 3
		created : Number, // 4
		support : {
			daily   : Number, // 5
			weekly  : Number, // 6
			monthly : Number, // 7
			all     : Number, // 8
			previous: Number  // 9
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
			},
			created: {
				range: schema.created,
				projection: [schema.id]
			}
		}/*,
		removed for the time being. add back if performance declines
		global: {
			id: {
				read: 6,
				write: 5,
				hash: schema.id,
				projection: 'ALL'
			}
		}*/
	})
};
