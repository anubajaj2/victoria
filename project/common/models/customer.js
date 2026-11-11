'use strict';

module.exports = function(Customer) {

	// A customer can be deleted only if no Entry exists for it.
	// Applies to every targeted delete (OData DELETE, REST, destroyById/destroyAll with a filter).
	// An unfiltered destroyAll({}) is the admin "delete all" purge in /deleteRecords and is not checked.
	Customer.observe('before delete', function(ctx, next) {
		var where = ctx.where || {};
		if (Object.keys(where).length === 0) {
			return next();
		}
		var Entry = Customer.app.models.Entry;

		Customer.find({ where: where, fields: { id: true } })
			.then(function(customers) {
				var ids = customers.map(function(c) { return c.id; });
				if (ids.length === 0) {
					return next();
				}
				return Entry.findOne({ where: { Customer: { inq: ids } }, fields: { id: true } })
					.then(function(entry) {
						if (entry) {
							var err = new Error('CUSTOMER_HAS_ENTRIES: Customer has entries, cannot be deleted');
							err.statusCode = 409;
							return next(err);
						}
						next();
					});
			})
			.catch(next);
	});
};
