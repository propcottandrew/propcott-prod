<?php namespace Laravact\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Foundation\Inspiring;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class Laravact extends Command {
	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'laravact';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = "Serve the application on the ReactPHP server";

	/**
	 * Execute the console command.
	 *
	 * @return mixed
	 */
	public function fire()
	{
		$host = $this->input->getOption('host');

		$port = $this->input->getOption('port');

		with(new \Laravact\Manager($host, $port))->run();

		$this->info("Laravact Manager running on http://{$host}:{$port}");
	}

	/**
	 * Get the console command options.
	 *
	 * @return array
	 */
	protected function getOptions()
	{
		return array(
			array('host', null, InputOption::VALUE_OPTIONAL, 'The host address to serve the application on.', 'localhost'),

			array('port', null, InputOption::VALUE_OPTIONAL, 'The port to serve the application on.', 8000),
		);
	}
}
/*
pool of two laravel servers
they have a restart minimum memory and maximum memory
when memory hits min, process asks manager if it can restart
if yes, stop listening, complete all current requests, and restart
if no, wait until restart signal is given

./bin/ppm start --help
Usage:
 start [--bridge="..."] [--port[="..."]] [--workers[="..."]] [--bootstrap[="..."]] [--app-env[="..."]] [working-directory]

Arguments:
 working-directory     The working directory.  (default: "./")

 --bridge              The bridge we use to convert a ReactPHP-Request to your target framework.
 --port                Load-Balancer port. Default is 8080
 --workers             Worker count. Default is 8. Should be minimum equal to the number of CPU cores.
 --app-env             The that your application will use to bootstrap.
 --bootstrap           The class that will be used to bootstrap your application.
 --help (-h)           Display this help message.
 --quiet (-q)          Do not output any message.
 --verbose (-v|vv|vvv) Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug
 --version (-V)        Display this application version.
 --ansi                Force ANSI output.
 --no-ansi             Disable ANSI output.
 --no-interaction (-n) Do not ask any interactive question.
 */
