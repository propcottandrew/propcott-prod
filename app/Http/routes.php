<?php

// Define available socialite providers
$providers = implode('|', str_replace('|', '\|', str_replace('\\', '\\\\', [
	'facebook',
	'twitter',
	'google',
])));

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------

/{page?}
/hot/{page?}
/top/{page?}
/new/{page?}
/c/{category}/{page?}
/c/{category}/hot/{page?}
/c/{category}/top/{page?}
/c/{category}/new/{page?}
/p/{id}

*/

Route::get('/', 'WelcomeController@index');
Route::get('/home', 'HomeController@index');


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::get('/register', 'AuthController@registerView');
Route::post('/register', 'AuthController@register');

Route::get('/logout', 'AuthController@logout');

Route::group(['prefix' => 'login'], function() use ($providers)
{
	Route::get('/', 'AuthController@loginView');
	Route::post('/', 'AuthController@login');
	
	Route::get('/verify', 'WelcomeController@showView'); // should redirect if query param is attached
	Route::post('/verify', 'WelcomeController@verifyCode');
	
	Route::get('/forgot', 'AuthController@forgotView');
	Route::post('/forgot', 'AuthController@forgot');
	
	Route::get('/reset/{token}', 'AuthController@resetView');
	Route::post('/reset', 'AuthController@reset');
	
	Route::get('/{provider}', 'AuthController@social')->where('provider', $providers);
	Route::get('/{provider}/callback', 'AuthController@callback')->where('provider', $providers);
});

/*
|--------------------------------------------------------------------------
| Account Routes
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'account'], function() use ($providers)
{
	Route::get('/', 'AccountController@index');
	Route::post('/', 'AuthController@update'); // should try to update and pass any messages to index (maybe flash?)
	
	Route::get('/merge', 'AccountController@mergeView');
	Route::post('/merge', 'AccountController@merge');
	
	Route::get('/split', 'AccountController@splitView');
	Route::post('/split', 'AccountController@split');
	
	// if an account exists, redirect to merge
	Route::get('/connect/{provider}', 'AuthController@social')->where('provider', $providers);
	Route::get('/connect/{provider}/callback', 'AuthController@callback')->where('provider', $providers);
	Route::get('/disconnect/{provider}', 'AuthController@social')->where('provider', $providers);
	// should have a copySettings parameter
});
