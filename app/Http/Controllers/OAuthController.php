<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Registrar;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\PasswordBroker;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Models\User;
use App\Models\UserSocialAccount;

/**
 * Todo
 * 
 * Fix forgot/reset
 * make forgot detect if there is a verified email at that address.
 */

class OAuthController extends Controller {

	/**
	 * The Guard implementation.
	 *
	 * @var \Illuminate\Contracts\Auth\Guard
	 */
	protected $auth;

	/**
	 * The registrar implementation.
	 *
	 * @var \Illuminate\Contracts\Auth\Registrar
	 */
	protected $registrar;

	/**
	 * Create a new authentication controller instance.
	 *
	 * @param  \Illuminate\Contracts\Auth\Guard  $auth
	 * @param  \Illuminate\Contracts\Auth\Registrar  $registrar
	 * @return void
	 */
	public function __construct(Guard $auth, Registrar $registrar)
	{
		$this->auth = $auth;
		$this->registrar = $registrar;
		
		$this->middleware('auth', ['only' => ['disconnect']]);
	}

	/**
	 * ...
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function connect($provider)
	{
		return \Socialize::with($provider)->redirect();
	}

	/**
	 * ...
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function callback($provider)
	{
		
		$external = \Socialize::with($provider)->user();
		
		$user = $this->auth->user();
		
		$account = UserSocialAccount::where('provider_id', '=', $external->getId())
			->where('provider', '=', $provider);

		if($account->count())
		{
			if($this->auth->check())
			{
				return redirect('/account/merge')
					->withErrors([
						$provider => 'The account you are trying to connect is already connected to another account.',
					]);
			}
			
			$account = $account->first();
			$user = $account->user;
			if ($this->auth->loginUsingId($user->id, true))
			{
				return redirect('/home');
			}

			return redirect('/login')
				->withErrors([
					$provider => 'An unexpected error occured.',
				]);

		} else {
			
			\DB::transaction(function() use ($external, $provider, &$user)
			{
				
				if (!$user) {
					$user = new User;
					$user->name = $external->getName();
					$user->email = $external->getEmail();
					$user->avatar = $external->getAvatar();
					$user->save();
				}
				
				$account = new UserSocialAccount;
				$account->user_id = $user->id;
				$account->provider = $provider;
				$account->provider_id = $external->getId();
				$account->name = $external->getName();
				$account->email = $external->getEmail();
				$account->avatar = $external->getAvatar();
				$account->save();
			});
			
			if ($this->auth->check()) {
				return redirect('/account');
			} elseif ($this->auth->login($user, true)) {
				return redirect('/home');
			}
			
			return redirect('/login')
				->withErrors([
					$provider => 'An unexpected error occured.',
				]);
			
		}
	}

	/**
	 * ...
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function disconnect($provider, Request $request)
	{
		if (\Request::isMethod('post')) {
			if ($request->input('yes')) {
				$account = UserSocialAccount::where('provider_id', '=', $request->input('id'))
					->where('provider', '=', $provider);
				
				if ($account->count()) {
					$account = $account->first();
					
					if ($account->user == $this->auth->user()) {
						$account->delete();
						
						return redirect('/account');
					} else {
						return redirect('/account')
							->withErrors([
								'account' => 'You do not own that account.'
							]);
					}
				} else {
					return redirect('/account')
						->withErrors([
							'account' => 'You do not own that account.'
						]);
				}
			}
			
			return redirect('/account');
		}
		
		return view('oauth.disconnect');
	}
}
