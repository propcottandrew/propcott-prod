<?php namespace App\Http\Controllers;

use Illuminate\Support\Collection;

class WelcomeController extends Controller {

	/*
	|--------------------------------------------------------------------------
	| Welcome Controller
	|--------------------------------------------------------------------------
	|
	| This controller renders the "marketing page" for the application and
	| is configured to only allow guests. Like most of the other sample
	| controllers, you are free to modify or remove it as you desire.
	|
	*/

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('guest');
	}

	/**
	 * Show the application welcome screen to the user.
	 *
	 * @return Response
	 */
	public function index()
	{
		return view('welcome', ['quote' => Collection::make([
			'When there is no desire, all things are at peace. - Laozi',
			'Simplicity is the ultimate sophistication. - Leonardo da Vinci',
			'Simplicity is the essence of happiness. - Cedric Bledsoe',
			'Smile, breathe, and go slowly. - Thich Nhat Hanh',
			'Simplicity is an acquired taste. - Katharine Gerould',
			'Well begun is half done. - Aristotle',
		])->random()]);
	}

}
