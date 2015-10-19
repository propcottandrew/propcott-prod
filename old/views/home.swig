{% extends 'base.swig' %}

{% block head.end %}
	{% parent %}
	<style type="text/css">
	#featured {
		position: relative;
		padding: 1em;
		height: 400px;
		background-image: url('http://static.propcott.com/images/logo-email-footer.png');
		background-repeat: no-repeat;
		background-position: center center;
	}
	#featured, #rightbar {
		border-radius: 10px;
		background-color: white;
	}
	#rightbar {
		padding: 1em;
	}
	#featured .buttons {
		position: absolute;
		bottom: 16px;
		right: 16px;
	}
	#featured a {
		border: 0px solid white;
		color: white;
		background: #B51010;
		font-family: 'Josefin Sans',sans-serif;
		border-radius: 5px;
		font-weight: bold;
		padding: .75em 1em;
		font-size: 1.4em;
		line-height: 1;
		display: inline-block;
	}
	#featured a:hover {
		text-decoration: none;
	}
	#featured h2 {
		margin: 0;
	}
	.tabs {
		margin-bottom: 16px;
	}
	.tabs button {
		font-size: 1.2em;
		font-weight: bold;
		color: #777;
		display: inline-block;
		margin: 0;
		padding: .5em;
		line-height: 1;
		border-radius: 4px;
		background: #eee;
		border: 0;
		font-family: 'Josefin Sans',sans-serif;
		transition: 300ms;
	}
	.tabs button:hover {
		background: #ccc;
		color: #555;
	}
	.tabs button.active {
		background: #B51010;
		color: white;
	}
	.tablist a {
		display: inline-block;
		line-height: 1.4;
	}
	.tablist p {
		margin: 0;
		line-height: 1.4;
	}
	</style>
{% endblock %}

{% block content %}
<div class="container" style="margin-top: 1em;">
	<div class="row">
		<div class="col-7">
			<div id="featured">
				<h2>Reinventing Boycotts</h2>
				<div class="buttons">
					<a href="/new">Start a Propcott</a>
					<a href="/about">Learn More</a>
				</div>
			</div>
		</div>
		<div class="col-5" style="vertical-align: top; padding-left: 1em;">
			<div id="rightbar">
				<div class="tabs">
					{% for tab in tabs %}
					<button id="tab-{{ tab.name.toLowerCase() }}-button"{% if loop.first %} class="active"{% endif %}>{{ tab.name }}</button>
					{% endfor %}
				</div>
				{% for tab in tabs %}
					<div id="tab-{{ tab.name.toLowerCase() }}" class="tablist"{% if !loop.first %} style="display: none;"{% endif %}>
						{% for propcott in tab.data %}
							<div style="margin-bottom: 1em; clear: both;">
								{% if propcott.media_type == 'image' %}
								<div id="propcott-media" style="float: left; width: 120px; height: 90px; background-image: url('http://static.propcott.com/{{ propcott.media_link }}');"></div>
								{% elseif propcott.media_type == 'video' %}
								<div id="propcott-media" style="float: left; width: 120px; height: 90px; background-image: url('http://img.youtube.com/vi/{{ propcott.media_link }}/mqdefault.jpg');"></div>
								{% else %}
								<div id="propcott-media" style="float: left; width: 120px; height: 90px; background-color: #aaa;"></div>
								{% endif %}
								<div style="overflow:hidden; font-size: .9em;">
									<a href="/p/{{ propcott.slug || propcott.id }}">{{ propcott.title || 'Untitled' }}</a>
									<p>Targeting {{ propcott.target }}<br>
									<span style="color: #B51010;">{{ propcott.supporters }} supporters</span></p>
								</div>
							</div>
						{% endfor %}
						{% if tab.link %}
						<p style="text-align: right;margin-bottom: 0;"><a href="{{ tab.link }}">View more...</a></p>
						{% endif %}
					</div>
				{% endfor %}
			</div>
		</div>
	</div>
</div>

<script type="text/javascript">
var tabs = [{% for tab in tabs %}'{{ tab.name.toLowerCase() }}'{% if !loop.last %},{% endif %}{% endfor %}];
for(var i=0; i<tabs.length; i++) (function(index) {
	document.getElementById('tab-' + tabs[index] + '-button').onclick = function() {
		for(var i=0; i<tabs.length; i++) {
			var tab = document.getElementById('tab-' + tabs[i] + '-button');
			if(tab != this) {
				document.getElementById('tab-' + tabs[i]).style.display = 'none';
				tab.className = '';
			}
		}
		document.getElementById('tab-' + tabs[index]).style.display = '';
		this.className = 'active';
	};
})(i);
</script>
{% endblock %}
