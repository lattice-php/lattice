<?php
declare(strict_types=1);

namespace Lattice\Ui\Components\Entries;

use BackedEnum;
use Lattice\Core\Support\Wire;
use Lattice\Ui\Attributes\AsEntry;
use Lattice\Ui\Enums\EntryType;
use Lattice\Ui\Enums\Icon;

#[AsEntry(EntryType::Boolean)]
class BooleanEntry extends Entry
{
    public string $trueIcon = Icon::Check->value;

    public string $falseIcon = Icon::X->value;

    public function icons(BackedEnum|string $true, BackedEnum|string $false): static
    {
        $this->trueIcon = Wire::scalar($true);
        $this->falseIcon = Wire::scalar($false);

        return $this;
    }
}
