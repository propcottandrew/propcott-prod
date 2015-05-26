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

// remove this one once learned from it
Route::get('/home', 'HomeController@index');

Route::get('/', 'WelcomeController@index');
Route::get('/', 'WelcomeController@index');



/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// replace these asap (D:\Work\Propcott\server\vendor\laravel\framework\src\Illuminate\Foundation\Auth)
Route::controllers([
	'auth' => 'Auth\AuthController',
	'password' => 'Auth\PasswordController',
]);

Route::get('/register', 'Auth\AuthController@registrationForm');
Route::post('/register', 'Auth\AuthController@register');

Route::get('/logout', 'Auth\AuthController@logout');

Route::group(['prefix' => 'login'], function() use ($providers)
{
	Route::get('/', 'Auth\AuthController@loginForm');
	Route::post('/', 'Auth\AuthController@login');
	
	Route::get('/verify', 'WelcomeController@showForm'); // should redirect if query param is attached
	Route::post('/verify', 'WelcomeController@verifyCode');
	
	Route::get('/forgot', 'WelcomeController@index');
	Route::get('/reset', 'WelcomeController@index');
	
	// Social network route and callback
	Route::get('/{provider}', 'Auth\AuthController@social')->where('provider', $providers);
	Route::get('/{provider}/callback', 'Auth\AuthController@callback')->where('provider', $providers);
});
