<?php
declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

final class NotificationChannel
{
    public static function for(object $notifiable): string
    {
        if (method_exists($notifiable, 'receivesBroadcastNotificationsOn')) {
            return $notifiable->receivesBroadcastNotificationsOn();
        }

        return str_replace('\\', '.', $notifiable::class).'.'.$notifiable->getKey();
    }
}
