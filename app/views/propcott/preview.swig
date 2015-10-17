{% extends '../base.swig' %}

{% block form-wrap %}/editor/handle{% endblock %}

{% block title %}Start a Propcott{% endblock %}

{% block content %}
<div class="navigation" style="background-color: #397DD8; color: #ffffff;" data-sticky="0">
	<div class="container">
		<button class="block round navigation-item" type="submit" name="action" value="cancel" style="margin-left: -.75em;">
			<span class="navigation-text">Cancel</span>
			<span class="typcn typcn-times"></span>
		</button>
		<a class="block round navigation-item" href="/editor">
			<span class="navigation-text">Edit</span>
			<span class="typcn typcn-pencil"></span>
		</a>
		<button class="block round navigation-item" type="submit" name="action" value="save">
			<span class="navigation-text">Save Propcott</span>
			<span class="typcn typcn-pin"></span>
		</button>
	</div>
</div>

<div class="container">
	<div class="row">
		<div class="col-7 push-5">
			<div id="propcott" class="propcott-full">
				<div id="propcott-featured-image">
					<h1 style="font-size: {{ propcott.title_size }}">{{ propcott.title }}</h1>
				</div>
				<div id="propcott-content">
					<p style="margin: 1em;">Propcotting <span style="color: rgb(215,0,0);">{{ propcott.target }}</span></p>

					<hr />

					<h2 class="headline">Goal</h2>
					<p style="margin: 1em;">{{ propcott.what }}</p>

					<hr />

					<h2 class="headline">Why</h2>
					<div style="margin: 0 1em;">{{ propcott.why }}</div>
				</div>
			</div>
		</div>
		<div class="col-5 pull-7">
			<div id="propcott-sidebar">
				{% if propcott.media_type == 'image' %}
				<div id="propcott-media" style="background-image: url('http://static.propcott.com/{{ propcott.media_link }}');"></div>
				{% elseif propcott.media_type == 'video' %}
				<div id="propcott-media">
					<iframe style="width: 100%; height: 250px;" src="https://www.youtube.com/embed/{{ propcott.media_link }}" frameborder="0" allowfullscreen></iframe>
				</div>
				{% else %}
				<div id="propcott-media"></div>
				{% endif %}

				<div style="margin: .5em 1em 1em 0">

					<p style="margin-bottom: 0;">What to do:</p>

					<div class="list-wrapper">{{ propcott.how }}</div>

					{% if propcott.alt %}
						<p style="margin-bottom: 0;">Instead, you may want to try...</p>
						<div class="list-wrapper">{{ propcott.alt }}</div>
					{% endif %}

					<p><button type="button" class="block join-button">Join!</button></p>
				</div>
			</div>
		</div>
	</div>
</div>
{% endblock %}
