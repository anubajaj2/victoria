'use strict';

module.exports = function(Group) {

	// A group can be deleted only if none of its customers has an Entry.
	// Customer.Group holds the Group id. An unfiltered destroyAll({}) (admin purge) is not checked.
	Group.observe('before delete', function(ctx, next) {
		var where = ctx.where || {};
		if (Object.keys(where).length === 0) {
			return next();
		}
		var Customer = Group.app.models.Customer;
		var Entry = Group.app.models.Entry;

		Group.find({ where: where, fields: { id: true } })
			.then(function(groups) {
				var groupIds = groups.map(function(g) { return g.id; });
				if (groupIds.length === 0) {
					return next();
				}
				return Customer.find({ where: { Group: { inq: groupIds } }, fields: { id: true } })
					.then(function(customers) {
						var custIds = customers.map(function(c) { return c.id; });
						if (custIds.length === 0) {
							return next();
						}
						return Entry.findOne({ where: { Customer: { inq: custIds } }, fields: { id: true } })
							.then(function(entry) {
								if (entry) {
									var err = new Error('GROUP_HAS_ENTRIES: A customer of this group has entries, group cannot be deleted');
									err.statusCode = 409;
									return next(err);
								}
								next();
							});
					});
			})
			.catch(next);
	});
};
