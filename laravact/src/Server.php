<?php namespace Laravact;

class Server extends \Worker {

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
	public function __construct($data, $host, $port, $num)
	{
		$this->data = $data;
		$this->host = $host;
		$this->port = $port;
		$this->online = false;
		$this->num = $num;
		
		$this->data[$this->num] = array($this->online, memory_get_usage(), memory_get_peak_usage());
	}

	/**
	 * Running HTTP Server
	 */
	public function run()
	{
		require __DIR__.'/../../bootstrap/autoload.php';
		
		$loop = new \React\EventLoop\StreamSelectLoop();
		$socket = new \React\Socket\Server($loop);
		$http = new \React\Http\Server($socket, $loop);
		
		$http->on('request', function ($request, $response) {
			$request->on('data', function($data) use($request, $response) {
				with(new HttpSession($this->host, $this->port))->handle($request, $response, $data);
				$this->data[$this->num] = array($this->online, memory_get_usage(), memory_get_peak_usage());
			});
		});
		
		//we 'probably' don't need a timer. we may need one to determine offline/online status though. maybe we can register a fatal err function that changes an 'online' variable
		//$loop->addPeriodicTimer(1, function() {
		//	printf('server %d: %s %s' . PHP_EOL, $this->num, formatBytes(memory_get_usage()), formatBytes(memory_get_peak_usage()));
		//});
		
		$socket->listen($this->port, '127.0.0.1');
		$loop->run();
		
		$this->online = true;
	}
}
