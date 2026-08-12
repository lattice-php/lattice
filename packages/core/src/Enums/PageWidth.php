<?php
declare(strict_types=1);

namespace Lattice\Core\Enums;

use Lattice\Core\Attributes\TypeScript;

/**
 * The measure a page's content is capped to, always centered in the layout
 * slot. A page has no siblings to size against, so it carries only this scale
 * and not the `auto`/`fill` flow behaviour a component's width offers.
 */
#[TypeScript]
enum PageWidth: string
{
    case Full = 'full';
    case Large = 'lg';
    case Medium = 'md';
    case Small = 'sm';
}
