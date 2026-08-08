<?php
declare(strict_types=1);

namespace Lattice\Notifications;

final class NotificationChannel
{
    public static function for(mixed $notifiable): string
    {
        if (is_object($notifiable) && method_exists($notifiable, 'receivesBroadcastNotificationsOn')) {
            return $notifiable->receivesBroadcastNotificationsOn();
        }

        return str_replace('\\', '.', $notifiable::class).'.'.$notifiable->getKey();
    }
}
