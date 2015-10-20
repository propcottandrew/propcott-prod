module.exports = {
	guest: require(app.http.middleware.guest),
	user: require(app.http.middleware.user)
};
