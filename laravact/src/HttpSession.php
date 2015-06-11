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
	public function __construct(\React\Http\Request $request, \React\Http\Response $response, $kernel)
	{
		$this->start = microtime(true);
		$this->request = $request;
		$this->response = $response;
		$this->kernel = $kernel;
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
		$headers = $this->request->getHeaders();
		
		if (isset($headers['Content-Length']))
		{
			if ($headers['Content-Length'] != strlen($data)) return;
		}
		
		$this->request_body = $data;
		$this->post_params = [];
		
		parse_str($data, $this->post_params);
		
		$request = \Illuminate\Http\Request::create(
			(isset($headers['HTTPS']) ? 'https://' : 'http://') . $headers['Host'] . $this->request->getPath(),
			$this->request->getMethod(),
			array_merge($this->request->getQuery(), $this->post_params),
			$this->getCookies($this->request->getHeaders()),
			[],
			[],
			$this->request_body
		);
		
		$response = $this->kernel->handle($request);
		
		$headers = array_merge($response->headers->allPreserveCase(), $this->buildCookies($response->headers->getCookies()));
		$this->response->writeHead($response->getStatusCode(), $headers);
		$this->response->end($response->getContent());
		$this->kernel->terminate($request, $response);
		
		printf('%.3fms -> %s%s' . PHP_EOL, microtime(true) - $this->start, $this->request->getHeaders()['Host'], $this->request->getPath());
		if (isset($headers['Content-Length'])) echo $this->request_body . PHP_EOL;
	}
}
