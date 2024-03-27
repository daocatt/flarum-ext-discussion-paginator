<?php

use Flarum\Extend;
use Flarum\Api\Serializer\ForumSerializer;


$extend = [
    // (new Extend\Frontend('admin'))
    //     ->js(__DIR__.'/js/dist/admin.js'),
    
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    // (new Extend\Locales(__DIR__ . '/locale')),

    
];

return $extend;