<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Registrar;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\PasswordBroker;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Todo
 * 
 * Fix forgot/reset
 * make forgot detect if there is a verified email at that address.
 */

class AuthController extends Controller {

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
	 * The password broker implementation.
	 *
	 * @var PasswordBroker
	 */
	protected $passwords;
	
	/*
	|--------------------------------------------------------------------------
	| Registration & Login Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the registration of new users, as well as the
	| authentication of existing users. By default, this controller uses
	| a simple trait to add these behaviors. Why don't you explore it?
	|
	*/

	/**
	 * Create a new authentication controller instance.
	 *
	 * @param  \Illuminate\Contracts\Auth\Guard  $auth
	 * @param  \Illuminate\Contracts\Auth\Registrar  $registrar
	 * @return void
	 */
	public function __construct(Guard $auth, Registrar $registrar, PasswordBroker $passwords)
	{
		$this->auth = $auth;
		$this->registrar = $registrar;
		$this->passwords = $passwords;

		$this->middleware('guest', ['except' => 'logout']);
	}

	/**
	 * Handle a registration request for the application.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function register(Request $request)
	{
		if (\Request::isMethod('post'))
		{
			$validator = $this->registrar->validator($request->all());

			if ($validator->fails())
			{
				$this->throwValidationException(
					$request, $validator
				);
			}

			$this->auth->login($this->registrar->create($request->all()));

			return redirect('/home');
		}
		
		return view('auth.register');
	}

	/**
	 * Handle a login request to the application.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function login(Request $request)
	{
		if (\Request::isMethod('post'))
		{
			$this->validate($request, [
				'email' => 'required|email', 'password' => 'required',
			]);

			$credentials = $request->only('email', 'password');

			if ($this->auth->attempt($credentials, $request->has('remember')))
			{
				return redirect('/home');
			}
			
			return redirect('/login')
				->withInput($request->except('password'))
				->withErrors([
					'email' => 'These credentials do not match our records.',
				]);
		}
		
		return view('auth.login');
	}

	/**
	 * Log the user out of the application.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function logout()
	{
		$this->auth->logout();
		return redirect(property_exists($this, 'redirectAfterLogout') ? $this->redirectAfterLogout : '/');
	}

	/**
	 * Send a reset link to the given user.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function forgot(Request $request)
	{
		if (\Request::isMethod('post'))
		{
			$this->validate($request, ['email' => 'required|email']);

			$response = $this->passwords->sendResetLink($request->only('email'), function($m)
			{
				$m->subject(isset($this->subject) ? $this->subject : 'Your Password Reset Link');
			});

			switch ($response)
			{
				case PasswordBroker::RESET_LINK_SENT:
					return redirect()->back()->with('status', trans($response));

				case PasswordBroker::INVALID_USER:
					return redirect()->back()->withErrors(['email' => trans($response)]);
			}
		}
		
		return view('auth.password');
	}

	/**
	 * Reset the given user's password.
	 *
	 * @param  Request  $request
	 * @return Response
	 */
	public function reset($token = null, Request $request)
	{
		if (\Request::isMethod('post'))
		{
			$this->validate($request, [
				'token' => 'required',
				'email' => 'required|email',
				'password' => 'required|confirmed',
			]);

			$credentials = $request->only(
				'email', 'password', 'password_confirmation', 'token'
			);

			$response = $this->passwords->reset($credentials, function($user, $password)
			{
				$user->password = bcrypt($password);

				$user->save();

				$this->auth->login($user);
			});

			switch ($response)
			{
				case PasswordBroker::PASSWORD_RESET:
					return redirect('/login');

				default:
					return redirect()->back()
						->withInput($request->only('email'))
						->withErrors(['email' => trans($response)]);
			}
		}
		
		if (is_null($token))
		{
			throw new NotFoundHttpException;
		}

		return view('auth.reset')->with('token', $token);
	}
}
