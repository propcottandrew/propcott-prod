<?php namespace Laravact;

use Symfony\Component\HttpFoundation\FileBag;
use Symfony\Component\HttpFoundation\HeaderBag;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\ServerBag;

class Request extends \Illuminate\Http\Request
{
    public function __construct(
        array $query = array(),
        array $request = array(),
        array $attributes = array(),
        array $cookies = array(),
        array $files = array(),
        array $server = array(),
        $content = null
    ) {
        //Do not init, we don't want to ...
    }

    /**
     * Creates a new request with values from a React Request
     *
     * @param \React\Http\Request $request
     * @return static
     */
    public static function fromReact(\React\Http\Request $request)
    {
        echo 'doin it';
        
        $this->baseUrl = '';
        
        /*$this->baseUrl = '';
        $this->requestUri = $request->getPath();
        //TODO :: handle request
        $this->request = new ParameterBag([]);
        $this->query = new ParameterBag($request->getQuery());
        //TODO :: handle attributes
        $this->attributes = new ParameterBag([]);
        //TODO :: handle cookies
        $this->cookies = new ParameterBag([]);
        //TODO :: handle files
        $this->files = new FileBag([]);
        //TODO :: emulate server
        $this->server = new ServerBag([]);
        $this->server->set('REQUEST_METHOD', $request->getMethod());
        $this->server->set('HTTPS', 'off'); //TODO :: get real information
        $this->headers = new HeaderBag($request->getHeaders());
        //TODO :: handle content
        //$this->content = $content;*/
    }
}
