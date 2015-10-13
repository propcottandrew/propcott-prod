var controllers = local('controllers');
var middleware = local('middleware');

module.exports = function(app) {
	app.get('/login', middleware.guest, controllers.auth.login)
	app.post('/login', middleware.guest, controllers.auth.authenticate);
	
	app.post('/register', middleware.guest, controllers.auth.register);
	app.get('/logout', middleware.user, controllers.auth.logout);
	
	app.get('/oauth/facebook', controllers.oauth.connect);
	app.get('/oauth/facebook/callback', controllers.oauth.callback);
	
	app.get('/account', middleware.user, controllers.account.general);
	app.post('/account', middleware.user, controllers.account.updateGeneral);
	
	app.get('/p/:slug', controllers.propcott.view);
	app.get('/p/:slug/delete', controllers.propcott.remove);
	app.get('/p/:slug/join', controllers.propcott.join);
	app.get('/p/:slug/edit', controllers.draft.load);
	
	app.get('/new', controllers.draft.fresh);
	app.get('/editor', controllers.draft.edit);
	app.get('/editor/preview', controllers.draft.preview);
	app.get('/editor/save', controllers.draft.save);
	app.post('/editor/handle', controllers.draft.handle);
	/*
	|--------------------------------------------------------------------------
	| Handle Actions
	|--------------------------------------------------------------------------
	|
	| save		(id) ? update propcott : create propcott from draft
	| 			redirect to draft or published propcott
	|
	| preview	update draft
	| 			redirect to preview
	|
	| cancel	cancel current draft
	| 			redirect to (id) ? propcott : homepage
	*/
};
