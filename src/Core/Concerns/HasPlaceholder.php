<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Concerns;

trait HasPlaceholder
{
    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }
}
