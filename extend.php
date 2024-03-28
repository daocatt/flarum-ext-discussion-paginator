<?php

use Flarum\Extend;

$extend = [

    // (new Extend\Locales(__DIR__ . '/locale')),

    // (new Extend\Frontend('admin'))
    //     ->js(__DIR__.'/js/dist/admin.js'),
    
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Middleware("api"))
        ->add(\Gtdxyz\DiscussionPaginator\Middleware\DiscussionMiddleware::class),
];

return $extend;