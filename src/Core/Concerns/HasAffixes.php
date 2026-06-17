<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use BackedEnum;
use Lattice\Lattice\Support\Affix;

trait HasAffixes
{
    public ?Affix $prefix = null;

    public ?Affix $suffix = null;

    public function prefix(Affix|BackedEnum|string $prefix): static
    {
        $this->prefix = Affix::from($prefix);

        return $this;
    }

    public function suffix(Affix|BackedEnum|string $suffix): static
    {
        $this->suffix = Affix::from($suffix);

        return $this;
    }
}
