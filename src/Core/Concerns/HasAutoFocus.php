<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Concerns;

trait HasAutoFocus
{
    public function autoFocus(bool $autoFocus = true): static
    {
        return $this->prop('autoFocus', $autoFocus);
    }
}
