<?php
declare(strict_types=1);

namespace Lattice\Ui\Components\Entries;

use Lattice\Ui\Attributes\AsEntry;
use Lattice\Ui\Concerns\HasColor;
use Lattice\Ui\Enums\EntryType;

#[AsEntry(EntryType::Badge)]
class BadgeEntry extends Entry
{
    use HasColor;
}
