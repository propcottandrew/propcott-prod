<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\Guard;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Models\User;
use App\Models\UserSocialAccount;

/**
 * Todo
 * 
 * Fix forgot/reset
 * make forgot detect if there is a verified email at that address.
 */

class AccountController extends Controller {
	
	/**
	 * Create a new authentication controller instance.
	 *
	 * @param  \Illuminate\Contracts\Auth\Guard  $auth
	 * @return void
	 */
	public function __construct(Guard $auth)
	{
		$this->auth = $auth;
		
		$this->middleware('auth');
	}
	
	/**
	 * Update account and show account management page.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{
		if (\Request::isMethod('post'))
		{
			$this->validate($request, [
				'email' => 'email',
			]);
			
			$user = \Auth::user();
			
			$user->name = $request->name;
			$user->email = $request->email;
		}
		
		return view('account.index');
	}
	
	/**
	 * Update account and show account management page.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function merge(Request $request)
	{
		return 'merge';
	}
	
	/**
	 * Update account and show account management page.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function delete(Request $request)
	{
		if ($request->isMethod('post')) {
			if ($request->input('yes')) {
				$user = $this->auth->user();
				$this->auth->logout();
				$user->delete();
				
				return redirect('/');
			}
			
			return redirect('/account');
		}
		
		return view('account.delete');
	}
}
