<?php namespace Laravact;

function formatBytes($size, $precision = 2, $useIEC = true)
{
	$suffixes = $useIEC ? array('', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB') : array('', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');  
	$factor = $useIEC ? 1024 : 1000;
	$base = log($size, $factor);

	return round(pow($factor, $base - floor($base)), $precision) . $suffixes[floor($base)];
}

class Manager {

	/**
	 * @var string
	 */
	protected $host;

	/**
	 * @var int
	 */
	protected $port;

	/**
	 *
	 *
	 * @param string $host binding host
	 * @param int $port binding port
	 */
	public function __construct($host, $port)
	{
		$this->host = $host;
		$this->port = $port;
	}
	
	/**
	 * Running HTTP Server
	 */
	public function run()
	{
		with(new \Laravact\Server($this->host, 5000, 1))->start();
		with(new \Laravact\Server($this->host, 5001, 2))->start();

		$loop = new \React\EventLoop\StreamSelectLoop();
		$socket = new \React\Socket\Server($loop);
		$http = new \React\Http\Server($socket, $loop);
		
		$http->on('request', function ($request, $response) {
			$response->writeHead(200, array('Content-Type' => 'text/plain'));
			$response->write('current: ' . formatBytes(memory_get_usage()) . "\n");
			$response->end('peak:    ' . formatBytes(memory_get_peak_usage()) . "\n\n");
		});
		
		$loop->addPeriodicTimer(1, function() {
			echo 'manager looping' . PHP_EOL;
			sleep(2);
		});
		
		$socket->listen($this->port, $this->host);
		$loop->run();
	}
}
