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
	public function __construct($data, $port)
	{
		
		// todo: fatal err function that changes 'online' variable
		
		$this->data = $data;
		$this->port = $port;
		$this->online = false;
		
		$this->updateStatus();
	}
	
	/**
	 * Show worker info to other threads
	 */
	public function updateStatus()
	{
		$this->data[$this->port] = array($this->online, memory_get_usage(), memory_get_peak_usage());
		printf('server %d: %s %s' . PHP_EOL, $this->port, formatBytes($this->data[$this->port][1]), formatBytes($this->data[$this->port][2]));
	}
	
	/**
	 * Running HTTP Server
	 */
	public function run()
	{
		require __DIR__.'/../../bootstrap/autoload.php';
		require __DIR__.'/../../bootstrap/app.php';
		
		$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
		
		$loop = \React\EventLoop\Factory::create();
		$socket = new \React\Socket\Server($loop);
		$http = new \React\Http\Server($socket, $loop);
		
		$http->on('request', function ($request, $response) use($kernel)
		{
			$session = new HttpSession($request, $response, $kernel);
			$request->on('data', function($data) use($session, $kernel)
			{
				$session->handle($data);
				$this->updateStatus();
			});
		});
		
		$socket->listen($this->port, '127.0.0.1');
		$loop->run();
		
		$this->online = true;
	}
}
