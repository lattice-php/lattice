<?php
declare(strict_types=1);

namespace Lattice\Ui\Components\Entries;

use Lattice\Ui\Attributes\AsEntry;
use Lattice\Ui\Concerns\HasCopyable;
use Lattice\Ui\Enums\EntryType;

#[AsEntry(EntryType::Text)]
class TextEntry extends Entry
{
    use HasCopyable;

    public ?string $placeholder = null;

    /** Shown in place of an empty value. */
    public function placeholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }
}
