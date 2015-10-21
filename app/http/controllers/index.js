module.exports = {
	auth: require(app.http.controllers.auth),
	oauth: require(app.http.controllers.oauth),
	account: require(app.http.controllers.account),
	propcott: require(app.http.controllers.propcott),
	draft: require(app.http.controllers.draft),
	editor: require(app.http.controllers.editor)
};
