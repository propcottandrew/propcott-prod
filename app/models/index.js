import base  from './base';
import store from './store';

export default new class Models {
	constructor() {
		this.base = base;
		this.store = store;
	}
};
