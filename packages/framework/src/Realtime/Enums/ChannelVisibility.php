<?php
declare(strict_types=1);

namespace Lattice\Realtime\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ChannelVisibility: string
{
    case Public = 'public';
    case Private = 'private';
    case Presence = 'presence';
}
