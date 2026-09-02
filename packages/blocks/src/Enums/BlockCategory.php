<?php
declare(strict_types=1);

namespace Lattice\Blocks\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum BlockCategory: string
{
    case Text = 'text';
    case Media = 'media';
    case Layout = 'layout';
    case Embed = 'embed';
}
