<?php
declare(strict_types=1);

namespace Lattice\Notifications;

final class NotificationChannel
{
    public static function for(mixed $notifiable): string
    {
        // is_object() narrows $notifiable so method_exists()'s object|class-string signature
        // doesn't widen the type for the receivesBroadcastNotificationsOn() call below; the
        // ::class/getKey() fallback stays on the permissive `mixed` type deliberately, since
        // narrowing it to `object` would make PHPStan reject getKey() as undefined.
        if (is_object($notifiable) && method_exists($notifiable, 'receivesBroadcastNotificationsOn')) {
            return $notifiable->receivesBroadcastNotificationsOn();
        }

        return str_replace('\\', '.', $notifiable::class).'.'.$notifiable->getKey();
    }
}
