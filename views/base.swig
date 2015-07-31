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
	body {
		background: #E8E8E8;
		padding-top: 52px;
	}
	a {
		color: #B51010;
	}
	* {
		word-break: break-word;
	}
	.container {
		padding-left: 1em;
		padding-right: 1em;
	}
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
	.block .typcn {
		font-size: 24px;
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
			<div class="alert-info">{{ messages }}</div>
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
									<span class="navigation-text">{{ user.name }}</span>
									{% if user.avatar %}
									<span class="navigation-avatar" style="background-image: url('{{ user.avatar }}');"></span>
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
