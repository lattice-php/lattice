<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasVariant
{
    public ?string $variant = null;

    public function variant(string $variant): static
    {
        $this->variant = $variant;

        return $this;
    }
}
