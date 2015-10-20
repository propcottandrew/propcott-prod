var c = require(app.http.controllers.index);
var m = require(app.http.middleware.index);

module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('home');
	});

	['about', 'contact', 'help', 'privacy', 'terms'].forEach(page => {
		app.get(`/${page}`, (req, res) => res.render(`static/${page}`));
	});

	app.get ('/login',    m.guest, c.auth.form);
	app.post('/login',    m.user,  c.auth.login);
	app.post('/register', m.guest, c.auth.register);
	app.get ('/logout',   m.user,  c.auth.logout);

	app.get ('/oauth/facebook',          c.oauth.connect);
	app.get ('/oauth/facebook/callback', c.oauth.callback);

	app.get ('/account', m.user, c.account.general);
	app.post('/account', m.user, c.account.updateGeneral);

	app.get ('/p/:slug',                m.slugToId,    c.propcott.view);
	app.get ('/p/:slug/join',   m.user, m.slugToId,    c.propcott.join);
	app.get ('/p/:slug/delete', m.user, m.ownPropcott, c.propcott.remove);
	app.get ('/p/:slug/edit',   m.user, m.ownPropcott, c.draft.load);

	app.get ('/new',            c.draft.fresh);
	app.get ('/editor',         c.draft.edit);
	app.get ('/editor/preview', c.draft.preview);
	app.get ('/editor/save',    c.draft.save);
	app.post('/editor/handle',  c.draft.handle);

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
