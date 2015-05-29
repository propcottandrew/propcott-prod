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

Route::match(['get', 'post'], '/register', 'AuthController@register');

Route::get('/logout', 'AuthController@logout');

Route::group(['prefix' => 'login'], function() use ($providers)
{
	Route::match(['get', 'post'], '/', 'AuthController@login');
	
	//Route::get('/verify', 'WelcomeController@showView'); // should redirect if query param is attached
	//Route::post('/verify', 'WelcomeController@verifyCode');
	
	Route::get('/forgot', 'AuthController@forgotView');
	Route::post('/forgot', 'AuthController@forgot');
	
	Route::match(['get', 'post'], '/reset/{token?}', 'AuthController@reset');
});

/*
|--------------------------------------------------------------------------
| OAuth Routes
|--------------------------------------------------------------------------
*/
Route::group(['prefix' => 'oauth'], function() use ($providers)
{
	Route::get('/connect/{provider}', 'OAuthController@connect')->where('provider', $providers);
	Route::get('/connect/{provider}/callback', 'OAuthController@callback')->where('provider', $providers);
	Route::match(['get','post'], '/disconnect/{provider}', 'OAuthController@disconnect')->where('provider', $providers);
});

/*
|--------------------------------------------------------------------------
| Account Routes
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'account'], function()
{
	Route::match(['get', 'post'], '/', 'AccountController@index');
	Route::match(['get', 'post'], '/merge', 'AccountController@merge');	
	Route::match(['get', 'post'], '/delete', 'AccountController@delete');
});
