<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Enums\Concerns\HasPrefixedWireType;

enum EntryType: string
{
    use HasPrefixedWireType;

    private const string Prefix = 'entry.';

    case Badge = 'entry.badge';
    case Boolean = 'entry.boolean';
    case Component = 'entry.component';
    case Date = 'entry.date';
    case Text = 'entry.text';
}
