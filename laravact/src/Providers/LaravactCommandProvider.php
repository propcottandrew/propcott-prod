<?php namespace Laravact\Providers;

use Illuminate\Support\ServiceProvider;
use Laravact\Console\Commands\Laravact;

class LaravactCommandProvider extends ServiceProvider {

	protected $commands = ['Laravact' => 'command.laravact'];

	public function boot()
	{

	}

	public function register()
	{
		$this->app->singleton('command.laravact', function()
		{
			return new Laravact();
		});
		$this->commands('command.laravact');
	}
}
