<?php namespace Laravact;

class HttpSession {

	/**
	 * @var string
	 */
	protected $host;

	/**
	 * @var int
	 */
	protected $port;

	/**
	 * @var string
	 */
	protected $request_body;

	/**
	 * @var array
	 */
	protected $post_params;

	/**
	 *
	 *
	 * @param string $host binding host
	 * @param int $port binding port
	 */
	public function __construct($host, $port, \React\Http\Request $request, \React\Http\Response $response, $kernel)
	{
		$this->host = $host;
		$this->port = $port;
		$this->request = $request;
		$this->response = $response;
		$this->kernel = $kernel;
	}

	protected function getRequestUri(array $headers, $path)
	{
		$protocol = "http://";
		if (isset($headers['HTTPS'])) {
			$protocol = "https://";
		}
		$http_host = $protocol.$this->host;//.(($this->port==80)?'':(':'.$this->port));
		if (isset($headers['Host'])) {
			//$http_host = $protocol.$headers['Host'];
		}
		if (isset($this->hostOverride)) {
			//$http_host = $protocol.$this->hostOverride;
		}

		return $http_host.$path;
	}

	protected function getCookies(array $headers)
	{
		$cookies = [];
		if (isset($headers['Cookie'])) {
			if (function_exists('http_parse_cookie')) {
				$cookie_data = http_parse_cookie($headers['Cookie']);
				if ($cookie_data) {
					$cookies = $cookie_data->cookies;
				}
			} else if (class_exists("\Guzzle\Parser\Cookie\CookieParser")) {
				$cookies = array_get(with(new \Guzzle\Parser\Cookie\CookieParser())->parseCookie($headers['Cookie']), 'cookies', []);
			} else if (class_exists("\GuzzleHttp\Cookie\SetCookie")) {
				foreach(\GuzzleHttp\Cookie\SetCookie::fromString($headers['Cookie'])->toArray() as $data) {
					$cookies[$data['Name']] = $data['Value'];
				}
			}
		}

		return $cookies;
	}

	protected function buildCookies(array $cookies)
	{
		$headers = [];
		foreach ($cookies as $cookie) {
			if (!isset($headers['Set-Cookie'])) {
				$headers['Set-Cookie'] = [];
			}
			$cookie_value = sprintf("%s=%s", rawurlencode($cookie->getName()), rawurlencode($cookie->getValue()));
			if ($cookie->getDomain()) {
				$cookie_value .= sprintf("; Domain=%s", $cookie->getDomain());
			}
			if ($cookie->getExpiresTime()) {
				$cookie_value .= sprintf("; Max-Age=%s", $cookie->getExpiresTime());
			}
			if ($cookie->getPath()) {
				$cookie_value .= sprintf("; Path=%s", $cookie->getPath());
			}
			if ($cookie->isSecure()) {
				$cookie_value .= "; Secure";
			}
			if ($cookie->isHttpOnly()) {
				$cookie_value .= "; HttpOnly";
			}
			$headers['Set-Cookie'][] = $cookie_value;
		}

		return $headers;
	}

	public function handle($data)
	{
		$start = microtime(true);
		
		$headers = $this->request->getHeaders();
		
		$request_complete = true;
		if(isset($headers['Content-Length']))
		{
			$request_complete = $headers['Content-Length'] == strlen($data);
		}
		
		echo "::" . $this->request->getPath() . PHP_EOL;
		
		if(!$request_complete) return;
		
		$this->post_params = [];
		$this->request_body = $data;
		
		parse_str($data, $this->post_params);
		$request = \Illuminate\Http\Request::create(
			$this->getRequestUri($this->request->getHeaders(), $this->request->getPath()),
			$this->request->getMethod(),
			array_merge($this->request->getQuery(), $this->post_params),
			$this->getCookies($this->request->getHeaders()),
			[],
			[],
			$this->request_body
		);
		/*print_r(array(
			$this->getRequestUri($this->request->getHeaders(), $this->request->getPath()),
			$this->request->getMethod(),
			array_merge($this->request->getQuery(), $this->post_params),
			$this->getCookies($this->request->getHeaders()),
			[],
			[],
			$this->request_body
		));*/
		$response = $this->kernel->handle($request);
		$headers = array_merge($response->headers->allPreserveCase(), $this->buildCookies($response->headers->getCookies()));
		try {
			$this->response->writeHead($response->getStatusCode(), $headers);
			$this->response->end($response->getContent());
		} finally {
			
		}
		
		$this->kernel->terminate($request, $response);
		
		echo $this->port . ': ' . (microtime(true) - $start) . 'ms' . PHP_EOL;
	}
}
