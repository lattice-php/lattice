<?php
declare(strict_types=1);

namespace Lattice\Notifications;

enum NotificationTranslationMode: string
{
    case Wire = 'wire';
    case Resolved = 'resolved';
}
