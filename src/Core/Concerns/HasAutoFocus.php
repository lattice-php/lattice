<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasAutoFocus
{
    public function autoFocus(bool $autoFocus = true): static
    {
        return $this->prop('autoFocus', $autoFocus);
    }
}
