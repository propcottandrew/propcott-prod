global.app     = require('../app');

require('dotenv').load();
require(app.init);
require(app.config.index);

var assert = require('assert');
var User   = require(app.models.user);

describe('User', () => {
	describe('#save()', () => {
		it('should save without error', done => {
			var user = new User();
			user.save(done);
		});
	});
});
