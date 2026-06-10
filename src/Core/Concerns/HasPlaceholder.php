<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasPlaceholder
{
    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }
}
