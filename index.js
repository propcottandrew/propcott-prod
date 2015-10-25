global.app     = require('./app');

require('dotenv').load();
require(app.init);
require(app.config.index);
require(app.boot);
