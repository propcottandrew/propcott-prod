@extends('app')

@section('content')
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
				<div class="panel-heading">Account</div>

				<div class="panel-body">
					@if (count($errors) > 0)
						<div class="alert alert-danger">
							<strong>Whoops!</strong> There were some problems with your input.<br><br>
							<ul>
								@foreach ($errors->all() as $error)
									<li>{{ $error }}</li>
								@endforeach
							</ul>
						</div>
					@endif
					<h2>Account Information</h2>
					<p>User {{ Auth::user()->id }}</p>
					<form role="form" method="POST" action="{{ url('/account') }}">
						<input type="hidden" name="_token" value="{{ csrf_token() }}">
						<p>Name: <input type="text" name="name" value="{{ Auth::user()->name }}" /></p>
						<p>Email: <input type="email" name="email" value="{{ Auth::user()->email }}" /></p>
						<p>Password: <input type="password" name="password" /></p>
						<p>Repeat Password: <input type="password" name="password_verify" /></p>
						<p>Avatar: <img src="{{ Auth::user()->avatar }}" style="max-width:80px; max-height:80px; margin-right:10px; border-radius:8px;" /> <input name="avatar" type="file" style="display:inline;" /></p>
						<p><input type="submit" value="Update" /> <input type="reset" value="Cancel" /></p>
					</form>
					<h2>Connected Accounts</h2>
					@forelse(Auth::user()->accounts as $account)
						<p><img src="{{ $account->avatar }}" style="max-width:80px; max-height:80px; margin-right:10px; border-radius:8px;" /> {{ $account->name }} (<a href="{{ url('/oauth/disconnect') }}/{{ $account->provider }}?id={{ $account->provider_id }}">disconnect</a>)</p>
					@empty
						<p>No connected accounts</p>
					@endforelse
					<p>
						Connect new account:
						<a href="{{ url('/oauth/connect/facebook') }}">Facebook</a>,
						<a href="{{ url('/oauth/connect/twitter') }}">Twitter</a>,
						<a href="{{ url('/oauth/connect/google') }}">Google</a>.
					</p>
					
					<h2>Account Management</h2>
					<p><a href="{{ url('/account/merge') }}">Merge</a> with another Propcott account.</p>
					<p><a href="{{ url('/account/delete') }}">Delete</a> your Propcott account.</p>
				</div>
			</div>
		</div>
	</div>
</div>
@endsection
