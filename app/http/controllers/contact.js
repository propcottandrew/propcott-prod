var ses      = require(app.aws).ses;

module.exports = function(req, res) {
	ses.sendEmail({
		Destination: {ToAddresses: [`${req.body.reason}@propcott.com`]},
		Message: {
			Body: {
				Text: {
					Data: JSON.stringify(req.body, null, 4),
					Charset: 'UTF-8'
				}
			},
			Subject: {
				Data: req.body.subject,
				Charset: 'UTF-8'
			}
		},
		Source: `Propcott <propcott@propcott.com>`,
		ReplyToAddresses: [`${req.body.name} <${req.body.email}>`]
	}, err => {
		if(err) {
			console.error(err);
			req.flash('An unexpected error occured');
		} else {
			req.flash('Message sent successfully');
		}
		res.render('static/contact');
	});
};
