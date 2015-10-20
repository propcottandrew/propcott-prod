'use strict';

var Base     = require(app.models.base);
var Propcott = require(app.models.propcott);
var stored   = require(app.decorators.stored);
var uuid     = require('uuid');

class Draft extends Base {
	constructor(data) {
		Propcott.call(this);
	}

	get draftId() {
		if(this.hasOwnProperty('draftId')) return this.draftId;
		this.draftId = hasher.to(this.creator.id) + '/' + uuid.v4();
		else this.draftId = uuid.v4();
	}
}

Draft.prototype.decorate(stored({
	bucket: () => 'drafts.data.propcott.com',
	key:    () => hasher.to(this.id) + '/data.json'
}));

//Draft.prototype.decorate(json());

module.exports = Draft;
