module.exports = {
	guest      : require(app.http.middleware.guest),
	user       : require(app.http.middleware.user),
	userR      : require(app.http.middleware.userR),
	slugToId   : require(app.http.middleware.slugToId),
	ownPropcott: require(app.http.middleware.ownPropcott),
	ownDraft   : require(app.http.middleware.ownDraft)
};
