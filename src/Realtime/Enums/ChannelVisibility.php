<?php
declare(strict_types=1);

namespace Lattice\Lattice\Realtime\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ChannelVisibility: string
{
    case Public = 'public';
    case Private = 'private';
    case Presence = 'presence';
}
