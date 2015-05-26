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
*/

Route::get('/', 'WelcomeController@index');
Route::get('/home', 'HomeController@index');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::get('/register', 'AuthController@registrationForm');
Route::post('/register', 'AuthController@register');

Route::get('/logout', 'AuthController@logout');

Route::group(['prefix' => 'login'], function() use ($providers)
{
	Route::get('/', 'AuthController@loginForm');
	Route::post('/', 'AuthController@login');
	
	Route::get('/verify', 'WelcomeController@showForm'); // should redirect if query param is attached
	Route::post('/verify', 'WelcomeController@verifyCode');
	
	Route::get('/forgot', 'AuthController@forgotForm');
	Route::post('/forgot', 'AuthController@forgot');
	Route::get('/reset/{token}', 'AuthController@resetForm');
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
	
	Route::get('/connect/{provider}', 'AuthController@social')->where('provider', $providers);
	Route::get('/connect/{provider}/callback', 'AuthController@callback')->where('provider', $providers);
});
