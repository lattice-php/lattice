<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasVariant
{
    public function variant(string $variant): static
    {
        return $this->prop('variant', $variant);
    }
}
