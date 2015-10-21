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
	app.post('/login',    m.guest, c.auth.login);
	app.post('/register', m.guest, c.auth.register);
	app.get ('/logout',   m.user,  c.auth.logout);

	app.get ('/oauth/facebook',          c.oauth.connect);
	app.get ('/oauth/facebook/callback', c.oauth.callback);

	app.get ('/account', m.user, c.account.general);
	app.post('/account', m.user, c.account.updateGeneral);
	app.get ('/account/propcotts', m.user, c.account.propcotts);

	app.get ('/d/:draftId',     m.userR, m.ownDraft,    c.propcott.viewDraft);
//	app.get ('/v/:slug',                 m.ownDraft,    c.propcott.view);
	app.get ('/p/:slug',                 m.slugToId,    c.propcott.view);
	app.get ('/p/:slug/join',   m.userR, m.slugToId,    c.propcott.join);
	app.get ('/p/:slug/delete', m.userR, m.ownPropcott, c.propcott.remove);
	app.get ('/p/:slug/edit',   m.userR, m.ownPropcott, c.editor.load);

	app.get ('/new',                     c.editor.fresh);
	app.get ('/editor',                  c.editor.edit);
	app.get ('/editor/preview',          c.editor.preview);
	app.get ('/editor/save',    m.userR, c.editor.save);
	app.post('/editor/handle',           c.editor.handle);

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
