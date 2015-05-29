@extends('app')

@section('content')
<div class="container">
	<div class="row">
		<div class="col-md-10 col-md-offset-1">
			<div class="panel panel-default">
				<div class="panel-heading">Delete Account</div>

				<div class="panel-body">
					<h2>Are you sure?</h2>
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
					
					<form role="form" method="POST">
						<input type="hidden" name="_token" value="{{ csrf_token() }}">
						<p>
							<input type="submit" name="yes" value="Yes" />
							<input type="submit" name="no" value="No" />
						</p>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
@endsection
