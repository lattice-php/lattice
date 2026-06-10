<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Enums\ButtonVariant;

trait HasVariant
{
    public ?ButtonVariant $variant = null;

    public function variant(ButtonVariant|string $variant): static
    {
        $this->variant = $variant instanceof ButtonVariant ? $variant : ButtonVariant::from($variant);

        return $this;
    }
}
