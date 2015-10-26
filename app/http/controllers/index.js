module.exports = {
	api: require(app.http.controllers.api),
	auth: require(app.http.controllers.auth),
	oauth: require(app.http.controllers.oauth),
	home: require(app.http.controllers.home),
	account: require(app.http.controllers.account),
	propcott: require(app.http.controllers.propcott),
	draft: require(app.http.controllers.draft),
	editor: require(app.http.controllers.editor),
	explore: require(app.http.controllers.explore),
	search: require(app.http.controllers.search)
};
