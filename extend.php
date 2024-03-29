<?php

use Flarum\Extend;
use Flarum\Api\Serializer\NotificationSerializer;
use Flarum\Notification\Notification;

$extend = [

    // (new Extend\Locales(__DIR__ . '/locale')),

    // (new Extend\Frontend('admin'))
    //     ->js(__DIR__.'/js/dist/admin.js'),
    
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Middleware("api"))
        ->add(\Gtdxyz\DiscussionPaginator\Middleware\DiscussionMiddleware::class),

    (new Extend\Conditional())
        ->whenExtensionEnabled('flarum-mentions', [
            (new Extend\ApiSerializer(NotificationSerializer::class))
                ->attribute('content', function ($serializer, Notification $notification) {
                    if($notification->type == 'postMentioned'){
                        if(is_array($notification->data) && array_key_exists('replyNumber',$notification->data)){
                            $data = $notification->data;
                            $data['replyNumber'] = ceil($data['replyNumber']/20);

                            return $data;
                        }
                    }
                    return $notification->data;
                })
                ->attribute('subject', function ($serializer, Notification $notification) {
                    
                    if($notification->type == 'userMentioned' && $notification->subject){
                        $subject = $notification->subject;
                        $subject->number = ceil($subject->number/20);
                        return $subject;
                    }
                    return $notification->subject;
                }),
        ]),
    (new Extend\Conditional())->whenExtensionEnabled('flarum-flags', [
        (new Extend\ApiSerializer(Flarum\Flags\Api\Serializer\FlagSerializer::class))
                ->attribute('post', function ($serializer, Flarum\Flags\Flag $flag) {
                    if($flag->post){
                        $data = $flag->post;
                        $data->number = ceil($data->number/20);
                        return $data;
                    }
                    return $flag->post;
                })
    ]),
];

return $extend;