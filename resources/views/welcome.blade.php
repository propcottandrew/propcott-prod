<html>
	<head>
		<title>Laravel</title>
		
		<link href='//fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>

		<style>
			body {
				margin: 0;
				padding: 0;
				width: 100%;
				height: 100%;
				color: #B0BEC5;
				display: table;
				font-weight: 100;
				font-family: 'Lato';
			}

			.container {
				text-align: center;
				display: table-cell;
				vertical-align: middle;
			}

			.content {
				text-align: center;
				display: inline-block;
			}

			.title {
				font-size: 96px;
				margin-bottom: 40px;
			}

			.quote {
				font-size: 24px;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<p style="font-style: italic; color: #aaa; font-family: sans-serif; font-size:0.9em;">Alpha version. Expect everything to break and change.<br />This application does not yet have a template and<br />everything you see is temporary for development.</p>
			
			<h1><img src="{{ url('/images/logo-large.png') }}" width="300" alt="Propcott" /></h1>
			
			@if(!Auth::check())
				<p style="font-size: 2em; font-weight: bold; margin: 0; line-height: 1em;"><a href="{{ url('/login') }}" style="text-decoration: none; color: #777;">Login</a> <span style="color: #ccc;">or</span> <a href="{{ url('/register') }}" style="text-decoration: none; color: #777;">Register</a></p>
			@else
				<p style="font-size: 2em; font-weight: bold; margin: 0; line-height: 1em;"><a href="{{ url('/account') }}" style="text-decoration: none; color: #777;">Account</a></p>			
			@endif
		</div>
	</body>
</html>
