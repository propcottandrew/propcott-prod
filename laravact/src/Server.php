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
		
		// we need a fatal err function that changes 'online' variable
		
		$this->data = $data;
		$this->host = $host;
		$this->port = $port;
		$this->online = false;
		$this->num = $num;
		
		$this->updateStatus();
	}
	
	/**
	 * Show worker info to other threads
	 */
	public function updateStatus()
	{
		$this->data[$this->num] = array($this->online, memory_get_usage(), memory_get_peak_usage());
		printf('server %d: %s %s' . PHP_EOL, $this->num, formatBytes($this->data[$this->num][1]), formatBytes($this->data[$this->num][2]));
	}
	
	/**
	 * Running HTTP Server
	 */
	public function run()
	{
		require __DIR__.'/../../bootstrap/autoload.php';
		require __DIR__.'/../../bootstrap/app.php';
		
		echo __DIR__.'/Server2.php' . PHP_EOL;
		//require __DIR__.'/Server2.php';
		
		$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
		
		$loop = \React\EventLoop\Factory::create();
		$socket = new \React\Socket\Server($loop);
		$http = new \React\Http\Server($socket, $loop);
		
		$http->on('request', function ($request, $response) use($kernel) {
			/*
			ini_set('xdebug.var_display_max_depth', 7);
			ini_set('xdebug.var_display_max_children', 1024);
			ini_set('xdebug.var_display_max_data', 1024); 
			ob_start();
			var_dump($request);
			$out = ob_get_clean();
			file_put_contents('filename.txt', $out);
			*/
			$session = new HttpSession($this->host, $this->port, $request, $response, $kernel);
			$request->on('data', function($data) use($session, $kernel) {
				$session->handle($data);
				$this->updateStatus();
			});
		});
		
		$socket->listen($this->port, '127.0.0.1');
		$loop->run();
		
		$this->online = true;
	}
}
