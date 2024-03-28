<?php

namespace Gtdxyz\DiscussionPaginator\Middleware;

use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class DiscussionMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        
        $actor = RequestUtil::getActor($request);
        
        if (strpos($request->getUri()->getPath(), '/discussions/') !== false && $request->getMethod() == 'GET') {

            $params = Arr::get($request->getQueryParams(), 'page');
            
            // convert near(actually page number) to real near.
            if(isset($params['near']) && is_numeric($params['near']) && $params['near'] > 0 && isset($params['limit'])){
                $params['near'] = ($params['near']-1)*$params['limit'] + 1 + $params['limit']/2;
                $request = $request->withQueryParams(['page'=>$params]);
            }
        }

        $response = $handler->handle($request);

        return $response;
    }
}
