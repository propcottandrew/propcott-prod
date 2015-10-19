<!DOCTYPE html>
<html lang="en">
<head>
	{% block head.start %}{% endblock %}
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">

	<title>{{ title || 'Propcott' }}</title>

	<link href="/css/style.css" rel="stylesheet">
	<link href="http://fonts.googleapis.com/css?family=Josefin+Sans:400,700,400italic,700italic|Merriweather:400,400italic,700,700italic" rel="stylesheet" type="text/css">
	<style type="text/css">
	#navigation {
		padding: 10px;
		border-bottom: 1px solid #eee;
		border-bottom: 1px solid rgba(0,0,0,0);
		box-shadow: 0 0 5px -1px rgba(0,0,0,0.5);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: white;
		z-index: 99;
	}
	.group {
		display: inline-block;
	}
	#navigation-logo {
		position: relative;
		width: 148px;
		height: 32px;
		background-image: url(/images/logo-header.png);
		background-repeat: no-repeat;
		margin-right: 25px;
		float: left;
	}
	.navigation-avatar {
		position: relative;
		width: 30px;
		height: 30px;
		line-height: 1;
		margin: 0;
		margin-right: -.75em;
		margin-left: .5em;
		left: -1px;
		top: -1px;
		background-repeat: no-repeat;
		background-position: center center;
		background-size: cover;
		display: inline-block;
		border-radius: 16px;
		vertical-align: bottom;
	}
	.navigation-item {
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		position: relative;
	}
	.navigation-item:hover {
		background: #f7f7f7;
		background: rgba(0,0,0,0.05);
		text-decoration: none;
	}
	.navigation-right {
		float: right;
		padding-right: 0;
		padding-left: 1.5em;
	}
	#footer {
		text-align: right;
		font-size: 0.9em;
		padding: 1em;
	}
	#footer p {
		font-family: 'Josefin Sans',sans-serif;
		font-weight: normal;
		line-height: 1.2;
		margin: 0;
	}
	#footer a {
		font-weight: normal;
		color: inherit;
	}
	.clearfix:after {
		visibility: hidden;
		display: block;
		font-size: 0;
		content: " ";
		clear: both;
		height: 0;
	}
	.clearfix { display: inline-block; }
	* html .clearfix { height: 1%; }
	.clearfix { display: block; }

	@media (max-width: 650px) {
		.container {
			padding-left: 1em;
			padding-right: 1em;
		}
		#navigation-logo {
			width: 27px;
			background-image: url(/images/logo-mobile-header.png);
		}

		.navigation-text:before {
			content: '';
			display: block;
			border: .5em solid transparent;
			border-bottom-color: rgba(0,0,0,0.85);
			border-top: none;
			position: absolute;
			left: 1em;
			bottom: 100%;
		}
		.navigation-right .navigation-text:before {
			left: auto;
			right: 1em;
		}
		.navigation-text {
			visibility: hidden;
			opacity: 0;
			transition: 300ms opacity, 300ms visibility;
			background: rgba(0,0,0,0.85);
			border-radius: .3em;
			color: white;
			padding: .5em;
			position: absolute;
			left: 0;
			top: 100%;
			margin-top: 2px;
			white-space: nowrap;
			pointer-events: none;
		}
		.navigation-right .navigation-text {
			left: auto;
			right: 0;
		}
		.navigation-item:hover .navigation-text {
			visibility: visible;
			opacity: 1;
		}
	}
	h1, h2, h3, h4, h5, h6 {
		text-transform: none;
	}
	.dropdown {
		position: relative;
		display: inline-block;
	}
	.dropdown-content {
		position: absolute;
		top: 100%;
		left: 0;
		background: white;
		border: 1px solid #ddd;
		box-shadow: 0 0 3px -1px rgba(0,0,0,0.2);
		list-style: none;
		margin: 0;
		padding: 0;
		border-radius: 5px;
		transition: 200ms;
		visibility: hidden;
		opacity: 0;
	}
	.dropdown:hover .dropdown-content {
		opacity: 1;
		visibility: visible;
	}
	.dropdown-content a {
		display: block;
		padding: .25em 1em;
		white-space: nowrap;
		font-family: 'Josefin Sans',sans-serif;
	}
	.dropdown-content a:hover {
		background: #f7f7f7;
		text-decoration: none;
	}
	#sidebar-signup-form {
		border: 1px solid #ddd;
		border-radius: 5px;
		overflow: hidden;
	}
	#sidebar-signup-form input {
		padding: .5em;
		border: 0px solid #ddd;
		border-bottom-width: 1px;
	}
	#sidebar-signup-form input.bottom {
		border-bottom-width: 0;
	}
	#sidebar-signup-form input.topleft {
		border-right-width: 1px;
	}
	.alert-info {
		padding: .5em;
		font-family: 'Josefin Sans',sans-serif;
		display: inline-block;
		background-color: #397DD8;
		color: white;
		font-size: 1.3em;
		border-radius: 10px;
		text-align: center;
		line-height: 1;
	}
	.alert-container {
		position: fixed;
		top: 62px;
		left: 0;
		right: 0;
		width: 100%;
		z-index: 999;
		pointer-events: none;
		height: 0;
		overflow: hidden;
		-webkit-animation: fadeout 3s;
		   -moz-animation: fadeout 3s;
		     -o-animation: fadeout 3s;
		        animation: fadeout 3s;
	}
	.alert-container p {
		margin: 0;
		padding: .5em;
		text-align: center;
		line-height: 1;
		font-family: 'Josefin Sans',sans-serif;
		color: white;
		font-size: 1.3em;
		display: inline-block;
		border-radius: 10px;
	}
	.alert-info {
		background-color: #397DD8;
	}
	.alert-error {
		background-color: rgb(117,0,0);
	}
	@-webkit-keyframes fadeout {
	  0%   { height: auto; opacity: 0; margin-top: -30px; }
	  10%  { height: auto; opacity: 1; margin-top: 0; }
	  80%  { height: auto; opacity: 1; margin-top: 0; }
	  100% { height: auto; opacity: 0; margin-top: -30px; }
	}
	@-moz-keyframes fadeout {
	  0%   { height: auto; opacity: 0; margin-top: -30px; }
	  10%  { height: auto; opacity: 1; margin-top: 0; }
	  80%  { height: auto; opacity: 1; margin-top: 0; }
	  100% { height: auto; opacity: 0; margin-top: -30px; }
	}
	@-o-keyframes fadeout {
	  0%   { height: auto; opacity: 0; margin-top: -30px; }
	  10%  { height: auto; opacity: 1; margin-top: 0; }
	  80%  { height: auto; opacity: 1; margin-top: 0; }
	  100% { height: auto; opacity: 0; margin-top: -30px; }
	}
	@keyframes fadeout {
	  0%   { height: auto; opacity: 0; margin-top: -30px; }
	  10%  { height: auto; opacity: 1; margin-top: 0; }
	  80%  { height: auto; opacity: 1; margin-top: 0; }
	  100% { height: auto; opacity: 0; margin-top: -30px; }
	}
	#propcott-media {
		height: 250px;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		background-color: #ffffff;
		margin: 0 1em 1em 0;
	}
	</style>
		<meta property="fb:app_id" content="1475586926065669" />
	<style type="text/css">
	.fb-comments.fb_iframe_widget {
		background-color: white;
		box-shadow: 0 0 3px 1px rgba(0,0,0,0.2);
		display: block !important;
		padding: 8px;
	}
	.fb-comments, .fb-comments * {
		width: 100% !important;
	}
	.row > * {
		vertical-align: top;
	}
	.propcott-full {
		background: white;
		box-shadow: 0 0 3px 1px rgba(0,0,0,0.2);
		margin-top: 1em;
		padding-bottom: 1px;
		margin-bottom: 1em;
	}
	#propcott-sidebar {
		margin: 1em 0 0 0;
	}
	#propcott-featured-image {
		background: url(/images/new-foreground/grunge-angles.png) repeat, url(/images/logo-large_300x197.png) bottom right no-repeat;
		min-height: 250px;
	}
	#propcott-industry {
		border: 0;
	}
	.propcott-outside-placeholder {
		position: relative;
	}
	.propcott-outside {
		position: absolute;
		right: 100%;
		width: 320px;
		padding: 16px 30px 0 0;
		margin: 1px 2px 0 0;
		text-align: right;
		border-top: 1px dashed #696969;
	}
	.propcott-outside h2 {
		margin: 0;
		font-size: 1.2em;
	}
	.propcott-outside p {
		margin: 0;
		padding: 0;
		font-size: .9em;
	}
	.propcott-full hr {
		border: none;
		border-top: 1px solid #eee;
		margin: 16px -16px 16px -16px;
		margin: 0;
	}
	p .typcn {
	  line-height: 1;
	  font-size: 1.5em;
	  top: .1em;
	  position: relative;
	}
	.editable-region {
		background: rgba(0,0,0,0);
		transition: 300ms background-color;
		border: none;
		padding: 1em;
	}
	.cke_editable:focus, .cke_editable:hover, .editable-region:focus, .editable-region:hover {
		background: rgba(0,0,0,0.035) !important;
	}
	@media(max-width: 600px) {
		.propcott-outside {
			margin: 0 !important;
			padding: 1em;
			background-color: #eeeeee;
			border: 1px solid #aaa;
			border-width: 1px 0;
			color: #777;
		}
	}
	.question-mark {
		display: inline-block;
		position: relative;
		text-align: center;
		cursor: default;
		margin-left: 10px;
		position: absolute;
		right: 6px;
		top: 15px;
		z-index: 1;
	}
	.question-mark-icon {
		font-size: 14px;
		font-weight: bold;
		color: white;
		vertical-align: text-bottom;
		z-index: 1;
		position: relative;
		width: 20px;
		height: 20px;
		background: #333;
		border-radius: 10px;
		display: block;
	}
	.question-mark-container {
		width: 300px;
		height: 8em;
		max-width: 20px;
		max-height: 20px;
		overflow: hidden;
		position: absolute;
		top: 0;
		right: 0;
		transition: 300ms;
		border-radius: 10px;
		pointer-events: none;
	}
	.question-mark-text {
		pointer-events: all;
		background: #333;
		border-radius: 10px;
		color: white;
		font-family: 'Josefin Sans',sans-serif;
		line-height: 1.2;
		text-align: left;
		display: block;
		width: 300px;
		padding: .5em;
		position: absolute;
		top: 0;
		right: 0;
	}
	.question-mark-text:before {
		content: '';
		display: block;
		float: right;
		width: 20px;
		height: 10px;
	}
	.question-mark:hover .question-mark-container {
		max-width: 300px;
		max-height: 5em;
	}
	#editor-1-toolbar > * {
		display: block !important;
	}
	.cke_editable, .cke_contents, .cke_inner, .cke_top, .cke {
		background: transparent !important;
		border: none !important;
		border-radius: 0 !important;
		margin: 0 !important;
		padding: 0 !important;
	}
	.cke_editable {
		height: auto !important;
	}
	.cke_toolgroup {
		margin: 0 !important;
		padding: 0 !important;
		border-radius: 0 !important;
		border: 0 !important;
	}
	.cke_toolbar_separator {
		background-color: #eee !important;
		margin: .1em 0px !important;
		height: 3.25em !important;
		width: 1px !important;
	}
	a.cke_button {
		border: 0 !important;
		border-radius: 0 !important;
		padding: 1em !important;
		cursor: pointer !important;
	}
	.cke_button_on {
		background: #92bce0 !important;
		background-color: #eee !important;
		box-shadow: inset 0 -3px rgba(207, 60, 60, 1) !important;
	}
	.cke_editable {
		border-top: 1px solid #eee !important;
		padding: 0 1em !important;
	}
	.autosize {
		display: block;
		overflow: auto;
		resize: none;
		width: 100%;
		height: 4em;
		vertical-align: text-bottom;
	}

	h1, #propcott-title {
		display: block;
		color: white;
		background: rgba(0,0,0,0.85);
		margin: 0;
		padding: 16px;
		border: 0;
		line-height: 1.2;
		font-weight: normal;
		font-family: 'Josefin Sans',sans-serif;
		font-size: 48px;
		text-transform: none;
	}

	#propcott-title::-webkit-input-placeholder {
	   color: white;
	}

	#propcott-title:-moz-placeholder {
	   color: white;
	}

	#propcott-title::-moz-placeholder {
	   color: white;
	}

	#propcott-title:-ms-input-placeholder {
	   color: white;
	}
	#propcott-content .headline {
		font-size: 24px;
		margin: 16px 0 -10px 16px;
	}
	.join-button {
		background: rgb(215, 0, 0);
		border: none;
		outline: none;
		cursor: pointer;
		border-radius: 5px;
		width: 100%;
		display: block;
		color: white;
		font-weight: bold;
		font-size: 1.5em;
	}
	.list-wrapper ul {
		margin-top: 0;
		font-weight: bold;
	}
	#propcott-media {
		margin-right: 0;
	}
	</style>
	<noscript>
		<style type="text/javascript">
			.autosize {
				height: 8em;
			}
		</style>
	</noscript>
	<!--[if lt IE 9]>
		<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
	{% block head.end %}{% endblock %}
</head>
<body>
	{% block body.start %}{% endblock %}
	{% if messages %}
	<div class="alert-container">
		<div class="container" style="text-align: center;">
			<div class="alert-info">{{ JSON.stringify(messages) }}</div>
		</div>
	</div>
	{% endif %}
		{% block navigation %}
		<div id="navigation">
			<div class="container">
				{% block navigation.left %}
					<a href="/"><div id="navigation-logo"></div></a>
					<a class="block round navigation-item" href="/search">
						<span class="navigation-text">Search</span>
						<span class="typcn typcn-zoom"></span>
					</a>
					<a class="block round navigation-item" href="/explore">
						<span class="navigation-text">Explore</span>
						<span class="typcn typcn-news"></span>
					</a>
					<a class="block round navigation-item" href="/new">
						<span class="navigation-text">Start a Propcott</span>
						<span class="typcn typcn-edit"></span>
					</a>
				{% endblock %}
				<div class="navigation-right">
					{% block navigation.right %}
						{% if !user %}
							<a class="block round navigation-item" href="/login">
								<span class="navigation-text">Log In</span>
								<span class="typcn typcn-user"></span>
							</a>
						{% else %}
							<span class="dropdown">
								<a href="/account" class="block round navigation-item">
									<span class="navigation-text">{{ session.user.name }}</span>
									{% if user.avatar %}
									<span class="navigation-avatar" style="background-image: url('{{ session.user.avatar }}');"></span>
									{% else %}
									<span class="typcn typcn-user"></span>
									{% endif %}
								</a>
								<ul class="dropdown-content">
									<li><a href="/account">Account</a></li>
									<li><a href="/account/propcotts">My Propcotts</a></li>
									<li><a href="/logout">Log out</a></li>
								</ul>
							</span>
						{% endif %}
					{% endblock %}
				</div>
			</div>
		</div>
		{% endblock %}

		{% block content %}{% endblock %}

	<div class="clearfix"></div>
	<div id="footer" class="container">
		<p>Copyright &copy; 2015 Propcott</p>
		<p>
			<a href="/about">About</a> &bull;
			<a href="/contact">Contact</a> &bull;
			<a href="/help">Help</a> &bull;
			<a href="/privacy">Privacy Policy</a> &bull;
			<a href="/terms">Terms of Service</a>
		</p>
	</div>
	{% block body.end %}{% endblock %}
</body>
</html>
