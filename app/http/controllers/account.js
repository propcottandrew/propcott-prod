var User     = require(app.models.user);
var hasher   = require(app.util.hasher);
var s3       = require(app.aws).s3;
var Propcott = require(app.models.propcott);
var async    = require('async');

module.exports.updateGeneral = function(req, res) {
	new User({id: req.session.user.id}).load((err, user) => {
		if(err) {
			console.error(err);
			req.flash('Could not update account');
			res.redirect('/account');
			return;
		}

		if(req.body.password && req.body.password != req.body.password_verify) {
			req.flash('Passwords do not match');
			res.redirect('/account');
			return;
		}
		if(req.body.password) {
			user.unlink('local', user.email);
			user.link('local', req.body.email || user.email, req.body.password);
		} else if(req.body.email) {
			user.relink('local', user.email, req.body.email);
		}

		delete req.body.password;
		delete req.body.password_verify;

		for(var i in req.body) user[i] = req.body[i];

		user.save(function(err, user) {
			if(err)
				req.flash('Could not update account');
			else
				req.flash('Account updated successfully');
			res.render('account/general', {user: user});
		});
	});
/*	$this->validate($request, [
		'email' => 'email',
	]);

	var user = req.session.user;

	foreach(['name', 'display_name', 'email', 'zip', 'gender', 'org', 'org_link'] as $prop)
		$user->{$prop} = $request->{$prop};

	if($request->has('birth-month') && $request->has('birth-year')) $user->birthday = date("Y-m-d", mktime(0, 0, 0, $request->get('birth-month') , 1, $request->get('birth-year')));

	user.save();
	req.flash('Account updated successfully!');*/
};

module.exports.general = function(req, res) {
	var user = new User({id: req.session.user.id});

	user.load(function(err, user) {
		if(err) {
			console.error(err);
			req.flash('Could not load account info');
			res.redirect('/');
			return;
		}
		res.render('account/general', {user: user});
	});
};

module.exports.unsubscribe = (req, res) => {
	new User(req.session.user).load((err, user) => {
		user.notifications = {};
		user.save(err => {
			if(!err) req.flash('You have unsubscribed from all notifications');
			res.redirect('/account/notifications');
		});
	});
};

module.exports.notifications = (req, res) => {
	async.waterfall([
		callback => new User(req.session.user).load(callback),
		(user, callback) => {
			if(req.method == 'GET') return callback(null, user);
			user.notifications['join-email']      = !!req.body['join-email']      || undefined;
			user.notifications['publish-email']   = !!req.body['publish-email']   || undefined;
			user.notifications['reminders-email'] = !!req.body['reminders-email'] || undefined;
			user.notifications['reminders-time']  = req.body['reminders-time'];
			user.save(callback);
		}
	], (err, user) => {
		if(err) req.flash('An unexpected error occurred');
		if(err) console.error(err);
		res.render('account/notifications', {user: user});
	});
};

module.exports.propcotts = (req, res) => {
	/*async.parallel({
		user: callback => new User({id: req.session.user.id}).load(callback),
		drafts: callback => s3.listObjects({
			Bucket: 'drafts.data.propcott.com',
			Prefix: `${hasher.to(req.session.user.id)}/`
		}, callback)
	}, (err, data) => {
		if(err) return console.error(err);
		var len = data.drafts.Prefix.length;
		data.drafts = data.drafts.Contents.map(v => v.Key.substr(len).slice(0,-5));
		data.propcotts = data.user.propcotts;
		res.render('account/propcotts', data);
	});*/
	
	async.parallel({
		user: callback => new User({id: req.session.user.id}).load(callback),
		drafts: callback => s3.listObjects({
			Bucket: 'drafts.data.propcott.com',
			Prefix: `${hasher.to(req.session.user.id)}/`
		}, callback)
	}, (err, data) => {
		if(err) return console.error(err);
		var len = data.drafts.Prefix.length;
		data.drafts = data.drafts.Contents.map(v => callback => {
			new Propcott({creator: req.session.user, draft_id: v.Key.substr(len).slice(0,-5)}).load(callback);
		});
		data.propcotts = data.user.propcotts.map(v => callback => {
			new Propcott({published: true, id: v}).load(callback);
		});
		async.parallel({
			drafts: callback => async.parallel(data.drafts, (err, results) => callback(err, results)),
			propcotts: callback => async.parallel(data.propcotts, (err, results) => callback(err, results))
		}, (err, results) => res.render('account/propcotts', results));
	});
	
};
