{% extends '../base.swig' %}

{% block content %}

{% block head.end %}
	{% parent %}
	<script src='https://www.google.com/recaptcha/api.js'></script>
{% endblock %}

{% block content %}
<div class="container">
	<div style="border-radius: 10px; padding: 1em; margin-bottom: 1em; background: white; margin-top: 1em;">
		<h1 style="margin-top: 0;">Contact <small>Propcott</small></h1>
		
		<form action="/mailer" method="POST">
			<p style="margin: 0; margin-bottom: 1em; line-height: 1.2;"><label>
				<strong>Name</strong><br>
				<input name="name" size="48">
			</label></p>
			
			<p style="margin: 0; margin-bottom: 1em; line-height: 1.2;"><label>
				<strong>Email</strong><br>
				<input name="email" size="48">
			</label></p>
			
			<p style="margin: 0; margin-bottom: 1em; line-height: 1.2;"><label>
				<strong>Organization</strong> (optional)<br>
				<input name="organization" size="48">
			</label></p>
			
			<p style="margin: 0; margin-bottom: 1em; line-height: 1.2;"><label>
				<strong>Reason for contacting</strong><br>
				<select name="reason">
					<option value="support">General Help and Support</option>
					<option value="propcott">Question or Issues with Propcotts</option>
					<option value="target">If you are being targeted</option>
					<option value="advertise">Advertise</option>
					<option value="support">Other</option>
				</select>
			</label></p>
			
			<p style="margin: 0; margin-bottom: 1em; line-height: 1.2;"><label>
				<strong>Subject</strong><br>
				<input name="subject" size="48">
			</label></p>
			
			<p style="margin: 0; margin-bottom: 1em; line-height: 1.2;"><label>
				<strong>Message</strong><br>
				<textarea name="message" rows="8" cols="60"></textarea>
			</label></p>
			
			<div class="g-recaptcha" data-sitekey="6Lf7aQkTAAAAAFNIggrxOMkz7cdqoUlCTRImBt6D"></div>
			<noscript>
				<iframe src="https://www.google.com/recaptcha/api/fallback?k=6Lf7aQkTAAAAAFNIggrxOMkz7cdqoUlCTRImBt6D"
					frameborder="0" scrolling="no"
					style="width: 302px; height:423px; border-style: none; margin-bottom: .25em;">
				</iframe>
				<div style="width: 302px; height: 60px; border-style: none; bottom: 12px; left: 25px; margin-bottom: 1em; padding: 0px; right: 25px; background: #f9f9f9; border: 1px solid #c1c1c1; border-radius: 3px;">
					<textarea id="g-recaptcha-response" name="g-recaptcha-response"
						class="g-recaptcha-response"
						style="width: 250px; height: 40px; border: 1px solid #c1c1c1;
						margin: 10px 25px; padding: 0px; resize: none;" >
					</textarea>
				</div>
			</noscript>
			
			{{ csrf_input() }}
			<p><input type="submit" value="Send"></p>
		</form>
	</div>
</div>
{% endblock %}
